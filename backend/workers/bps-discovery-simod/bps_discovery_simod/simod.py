import json
import logging
import subprocess
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from uuid import UUID

import yaml
from bps_discovery_simod.settings import settings
from pix_portal_lib.kafka_clients.email_producer import EmailNotificationProducer, EmailNotificationRequest
from pix_portal_lib.service_clients.asset import AssetServiceClient, AssetType, File_, Asset
from pix_portal_lib.service_clients.file import FileType
from pix_portal_lib.service_clients.processing_request import (
    ProcessingRequestServiceClient,
    ProcessingRequest,
    ProcessingRequestStatus,
)
from pix_portal_lib.service_clients.project import ProjectServiceClient
from pix_portal_lib.service_clients.user import UserServiceClient

logger = logging.getLogger()


class InputAssetMissing(Exception):
    def __init__(self, message: Optional[str] = None):
        if message is not None:
            super().__init__(message)
        else:
            super().__init__("Simod discovery failed. Input asset not found.")


class SimodDiscoveryFailed(Exception):
    def __init__(self, message: Optional[str] = None):
        if message is not None:
            super().__init__(message)
        else:
            super().__init__("Simod discovery failed.")


class SimodService:
    src_dir: Path = Path("/usr/src/Simod")
    run_sh_script: Path = src_dir / "run.sh"

    def __init__(self):
        self._assets_base_dir = settings.asset_base_dir
        self._simod_results_base_dir = settings.simod_results_base_dir
        self._asset_service_client = AssetServiceClient()
        self._processing_request_service_client = ProcessingRequestServiceClient()
        self._project_service_client = ProjectServiceClient()
        self._user_service_client = UserServiceClient()

        self._assets_base_dir.mkdir(parents=True, exist_ok=True)
        self._simod_results_base_dir.mkdir(parents=True, exist_ok=True)

    async def process(self, processing_request: ProcessingRequest):
        """
        Downloads the input assets, runs Simod, and uploads the output assets
        while updating all the dependent services if new assets have been produced.
        """

        # Simod discovery stdout and stderr
        result_stdout = ""
        result_stderr = ""

        try:
            # update processing request status
            await self._processing_request_service_client.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.RUNNING
            )

            # download assets
            assets = [
                await self._asset_service_client.download_asset(asset_id, self._assets_base_dir, is_internal=True)
                for asset_id in processing_request.input_assets_ids
            ]

            config_file, event_log_file, event_log_column_mapping_file = self._extract_input_files(assets)
            # NOTE: event_log_column_mapping_file is optional
            self._validate_input_files([config_file, event_log_file])

            # update Simod configuration to include the correct event log path
            self._update_configuration_file(
                config_file.path,
                event_log_file.path,
                event_log_column_mapping_file.path if event_log_column_mapping_file else None,
            )

            # run Simod, it can take hours
            results_dir = self._simod_results_base_dir / processing_request.processing_request_id
            results_dir.mkdir(parents=True, exist_ok=True)
            result = _start_simod_discovery_subprocess(config_file.path, results_dir)
            result_stdout = result.stdout if result.stdout is not None else ""
            result_stderr = result.stderr if result.stderr is not None else ""

            # upload results and create corresponding assets
            result_dir = result.output_dir
            bpmn_path, prosimos_json_path = self._find_simod_results_file_paths(result_dir, event_log_file.path)
            bpmn_file = File_(name=bpmn_path.name, type=FileType.PROCESS_MODEL_BPMN, path=bpmn_path)
            prosimos_json_file = File_(
                name=prosimos_json_path.name, type=FileType.SIMULATION_MODEL_PROSIMOS_JSON, path=prosimos_json_path
            )
            simulation_model_asset_id = await self._asset_service_client.create_asset(
                files=[bpmn_file, prosimos_json_file],
                project_id=processing_request.project_id,
                asset_name=bpmn_path.stem,
                asset_type=AssetType.SIMULATION_MODEL,
                users_ids=[UUID(processing_request.user_id)],
            )

            # update project assets
            # NOTE: assets must be added to the project first before adding them to the processing request,
            #   because the processing request service checks if the assets belong to the project
            await self._project_service_client.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=simulation_model_asset_id,
            )

            # update output assets in the processing request
            await self._processing_request_service_client.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=simulation_model_asset_id,
            )

            # update processing request status
            await self._processing_request_service_client.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.FINISHED
            )

            # send email notification to queue
            if processing_request.should_notify:
                await self._send_email_notification(processing_request, is_success=True)
        except Exception as e:
            trace = traceback.format_exc()
            logger.error(
                f"Simod discovery failed: {e}, "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"stdout={result_stdout}, "
                f"stderr={result_stderr}, "
                f"trace={trace}"
            )

            # update processing request status
            await self._processing_request_service_client.update_status(
                processing_request_id=processing_request.processing_request_id,
                status=ProcessingRequestStatus.FAILED,
                message=str(e),
            )

            # send email notification to queue
            if processing_request.should_notify:
                await self._send_email_notification(processing_request, is_success=False, message=e.__str__())

        # set token to None to force re-authentication, because the token might have expired
        self._asset_service_client.nullify_token()
        self._asset_service_client._file_client.nullify_token()
        self._project_service_client.nullify_token()
        self._processing_request_service_client.nullify_token()

    def _extract_input_files(self, assets: list[Asset]) -> tuple[Optional[File_], Optional[File_], Optional[File_]]:
        files: list[File_] = []
        for asset in assets:
            if asset.files is not None:
                files.extend(asset.files)

        config_file = self._find_file_by_type(files, FileType.CONFIGURATION_SIMOD_YAML)
        event_log_file = self._find_file_by_type(files, FileType.EVENT_LOG_CSV) or self._find_file_by_type(
            files, FileType.EVENT_LOG_CSV_GZ
        )
        event_log_column_mapping_file = self._find_file_by_type(files, FileType.EVENT_LOG_COLUMN_MAPPING_JSON)

        return config_file, event_log_file, event_log_column_mapping_file

    @staticmethod
    def _find_file_by_type(files: list[File_], type: FileType) -> Optional[File_]:
        for file in files:
            if file.type == type:
                return file
        return None

    @staticmethod
    def _validate_input_files(files: list[File_]):
        for f in files:
            if f is None or f.path is None or not Path(f.path).exists():
                raise InputAssetMissing()

    @staticmethod
    def _update_configuration_file(config_path: Path, event_log_path: Path, column_mapping_path: Optional[Path] = None):
        content = config_path.read_bytes()
        config = yaml.safe_load(content)

        config["common"]["train_log_path"] = str(event_log_path.absolute())

        # NOTE: test log is not supported for discovery in production
        config["common"]["test_log_path"] = None

        # NOTE: column mapping format must correspond to EventLogIDs from pix-framework
        if column_mapping_path:
            column_mapping = json.load(column_mapping_path.open("r"))
            config["common"]["log_ids"] = column_mapping

        content = yaml.dump(config)

        config_path.write_bytes(content.encode("utf-8"))

    @staticmethod
    def _find_simod_results_file_paths(results_dir: Path, event_log_path: Path) -> tuple[Path, Path]:
        # The results dir has the following files:
        # - <event-log-name>.bpmn
        # - <event-log-name>.json
        # - canonical_model.json
        # - configuration.yaml
        # - evaluation (dir)

        event_log_path_stem = _remove_all_suffixes(event_log_path).name
        bpmn_path = results_dir / f"{event_log_path_stem}.bpmn"
        bps_model_path = results_dir / f"{event_log_path_stem}.json"

        if not bpmn_path.exists():
            raise SimodDiscoveryFailed(f"Simod discovery failed. BPMN file not found: {bpmn_path}")
        if not bps_model_path.exists():
            raise SimodDiscoveryFailed(f"Simod discovery failed. BPS model file not found: {bps_model_path}")

        return bpmn_path, bps_model_path

    async def _send_email_notification(
        self, processing_request: ProcessingRequest, is_success: bool, message: str = ""
    ):
        email_notification_producer = EmailNotificationProducer(client_id="bps-discovery-simod")
        user = await self._user_service_client.get_user(user_id=UUID(processing_request.user_id))
        user_email = str(user["email"])
        if is_success:
            msg = EmailNotificationRequest(
                processing_request_id=processing_request.processing_request_id,
                to_addrs=[user_email],
                subject="[PIX Notification] BPS discovery and optimization with Simod has finished",
                body=f"Processing request {processing_request.processing_request_id} has finished successfully.",
            )
        else:
            msg = EmailNotificationRequest(
                processing_request_id=processing_request.processing_request_id,
                to_addrs=[user_email],
                subject="[PIX Notification] BPS discovery and optimization with Simod has failed",
                body=f"Processing request {processing_request.processing_request_id} has failed.",
            )
        if message:
            msg.body += f"\n\nDetails:\n{message}"
        email_notification_producer.send_message(msg)


def _remove_all_suffixes(path: Path) -> Path:
    if path.suffix == "":
        return path
    return _remove_all_suffixes(path.with_suffix(""))


@dataclass
class SimodDiscoveryResult:
    return_code: int
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    output_dir: Optional[Path] = None


def _start_simod_discovery_subprocess(configuration_path: Path, output_dir: Path) -> SimodDiscoveryResult:
    result = subprocess.run(
        ["bash", "/usr/src/Simod/run.sh", str(configuration_path), str(output_dir)],
        cwd="/usr/src/Simod/",
        capture_output=True,
        check=True,
    )

    result_dir = output_dir / "best_result"
    if not result_dir.exists():
        raise SimodDiscoveryFailed(f"Simod discovery failed. Result directory not found: {result_dir}")

    return SimodDiscoveryResult(
        return_code=result.returncode, stdout=str(result.stdout), stderr=str(result.stderr), output_dir=result_dir
    )
