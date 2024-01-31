import json
import logging
import os
import stat
import statistics
import traceback
from collections import namedtuple
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import UUID

from pix_portal_lib.kafka_clients.email_producer import EmailNotificationProducer, EmailNotificationRequest
from pix_portal_lib.service_clients.asset import Asset, AssetServiceClient, AssetType, File_
from pix_portal_lib.service_clients.file import FileType
from pix_portal_lib.service_clients.processing_request import (
    ProcessingRequest,
    ProcessingRequestServiceClient,
    ProcessingRequestStatus,
)
from pix_portal_lib.service_clients.project import ProjectServiceClient
from pix_portal_lib.service_clients.user import UserServiceClient
from prosimos.simulation_engine import run_simulation

from simulation_prosimos.settings import settings

logger = logging.getLogger()


class InputAssetMissing(Exception):
    def __init__(self, message: Optional[str] = None):
        if message is not None:
            super().__init__(message)
        else:
            super().__init__("Input asset not found.")


class ProsimosSimulationFailed(Exception):
    pass


ProsimosConfiguration = namedtuple("ProsimosConfiguration", ["total_cases", "starting_at", "is_event_added_to_log"])


def _prosimos_configuration_from_simulation_model(simulation_model_path: Path) -> ProsimosConfiguration:
    simulation_model = json.load(simulation_model_path.open("r"))
    # timestamp with tz

    config = ProsimosConfiguration(
        total_cases=simulation_model.get("total_cases", 1000),
        starting_at=simulation_model.get("starting_at", datetime.now(tz=timezone.utc)),
        is_event_added_to_log=simulation_model.get("is_event_added_to_log", False),
    )
    return config


class ProsimosService:
    def __init__(self):
        self._assets_base_dir = settings.asset_base_dir
        self._prosimos_results_base_dir = settings.prosimos_results_base_dir
        self._asset_service_client = AssetServiceClient()
        self._processing_request_service_client = ProcessingRequestServiceClient()
        self._project_service_client = ProjectServiceClient()
        self._user_service_client = UserServiceClient()

        self._assets_base_dir.mkdir(parents=True, exist_ok=True)
        self._prosimos_results_base_dir.mkdir(parents=True, exist_ok=True)

        self._default_prosimos_event_log_column_mapping_file_path = (
            self._write_default_prosimos_event_log_column_mapping_file()
        )
        if not self._default_prosimos_event_log_column_mapping_file_path.exists():
            raise FileNotFoundError(
                f"Default Prosimos event log column mapping file not found: "
                f"{self._default_prosimos_event_log_column_mapping_file_path}"
            )

    async def process(self, processing_request: ProcessingRequest):
        """
        Downloads the input assets, runs Prosimos, and uploads the output assets
        while updating all the dependent services if new assets have been produced.
        """
        files_to_delete = []
        file_paths_to_delete = []
        try:
            # update processing request status
            await self._processing_request_service_client.update_request(
                processing_request_id=processing_request.processing_request_id,
                status=ProcessingRequestStatus.RUNNING,
                start_time=datetime.utcnow(),
            )

            # download assets
            assets = [
                await self._asset_service_client.download_asset(asset_id, self._assets_base_dir, is_internal=True)
                for asset_id in processing_request.input_assets_ids
            ]
            for asset in assets:
                if asset.files is not None:
                    files_to_delete.extend(asset.files)

            # get and validate input files
            bpmn_file, prosimos_json_file = self._extract_input_files(assets)
            self._validate_input_files([bpmn_file, prosimos_json_file])
            config = _prosimos_configuration_from_simulation_model(prosimos_json_file.path)

            logger.info(
                f"Running Prosimos simulation, "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"bpmn_file={bpmn_file}, "
                f"simulation_model_file={prosimos_json_file}"
            )

            # run Prosimos, it can take time
            output_path = self._prosimos_results_base_dir / f"{processing_request.processing_request_id}.csv"
            statistics_path = (
                self._prosimos_results_base_dir / f"{processing_request.processing_request_id}_statistics.csv"
            )
            file_paths_to_delete.extend([output_path, statistics_path])
            self._run_prosimos(
                bpmn_path=bpmn_file.path,
                simulation_model_path=prosimos_json_file.path,
                statistics_path=statistics_path,
                output_path=output_path,
                configuration=config,
            )

            # upload results and create corresponding assets
            synthetic_event_log_file = File_(name=output_path.name, type=FileType.EVENT_LOG_CSV, path=output_path)
            default_prosimos_column_mapping_file = File_(
                name="default_prosimos_event_log_column_mapping.json",
                type=FileType.EVENT_LOG_COLUMN_MAPPING_JSON,
                path=self._default_prosimos_event_log_column_mapping_file_path,
            )
            statistics_file = File_(
                name=statistics_path.name, type=FileType.STATISTICS_PROSIMOS_CSV, path=statistics_path
            )
            synthetic_event_log_asset_id = await self._asset_service_client.create_asset(
                files=[synthetic_event_log_file, default_prosimos_column_mapping_file, statistics_file],
                asset_name=synthetic_event_log_file.name,
                asset_type=AssetType.EVENT_LOG,
                project_id=processing_request.project_id,
                users_ids=[UUID(processing_request.user_id)],
            )

            # update project assets
            # NOTE: assets must be added to the project first before adding them to the processing request,
            #   because the processing request service checks if the assets belong to the project
            await self._project_service_client.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=synthetic_event_log_asset_id,
            )

            # update output assets in the processing request
            await self._processing_request_service_client.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=synthetic_event_log_asset_id,
            )

            # update processing request status
            await self._processing_request_service_client.update_request(
                processing_request_id=processing_request.processing_request_id,
                status=ProcessingRequestStatus.FINISHED,
                end_time=datetime.utcnow(),
            )

            # send email notification to queue
            if processing_request.should_notify:
                await self._send_email_notification(processing_request, is_success=True)
        except Exception as e:
            trace = traceback.format_exc()
            logger.error(
                f"Prosimos simulation failed: {e}, "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"trace={trace}"
            )

            # update processing request status
            await self._processing_request_service_client.update_request(
                processing_request_id=processing_request.processing_request_id,
                status=ProcessingRequestStatus.FAILED,
                end_time=datetime.utcnow(),
                message=str(e),
            )

            # send email notification to queue
            if processing_request.should_notify:
                await self._send_email_notification(processing_request, is_success=False)
        finally:
            for file in files_to_delete:
                if file.path.exists():
                    file.path.unlink()

        # set token to None to force re-authentication, because the token might have expired
        self._asset_service_client.nullify_token()
        self._asset_service_client._file_client.nullify_token()
        self._project_service_client.nullify_token()
        self._processing_request_service_client.nullify_token()

    def _extract_input_files(self, assets: list[Asset]) -> tuple[Optional[File_], Optional[File_]]:
        files: list[File_] = []
        for asset in assets:
            if asset.files is not None:
                files.extend(asset.files)

        bpmn_file = self._find_file_by_type(files, FileType.PROCESS_MODEL_BPMN)
        prosimos_json_file = self._find_file_by_type(files, FileType.SIMULATION_MODEL_PROSIMOS_JSON)

        return bpmn_file, prosimos_json_file

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
    def _run_prosimos(
        bpmn_path: Path,
        simulation_model_path: Path,
        statistics_path: Path,
        output_path: Path,
        configuration: ProsimosConfiguration,
    ):
        logger.info(f"Running Prosimos simulation with configuration: {configuration}")

        run_simulation(
            bpmn_path=bpmn_path,
            json_path=simulation_model_path,
            stat_out_path=statistics_path,
            total_cases=configuration.total_cases,
            log_out_path=output_path,
            starting_at=str(configuration.starting_at),
            is_event_added_to_log=configuration.is_event_added_to_log,
        )

    async def _send_email_notification(self, processing_request: ProcessingRequest, is_success: bool):
        try:
            email_notification_producer = EmailNotificationProducer(client_id="simulation-prosimos")
            user = await self._user_service_client.get_user(user_id=UUID(processing_request.user_id))
            logger.info(f"Sending email notification to user: {user}")
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
            email_notification_producer.send_message(msg)
        except Exception as e:
            logger.error(f"Failed to send email notification: {e}")

    def _write_default_prosimos_event_log_column_mapping_file(self) -> Path:
        default_prosimos_event_log_column_mapping = {
            "case": "case_id",
            "activity": "activity",
            "enabled_time": "enable_time",
            "start_time": "start_time",
            "end_time": "end_time",
            "resource": "resource",
        }

        file_path = self._assets_base_dir / "default_prosimos_event_log_column_mapping.json"
        if not file_path.exists():
            json.dump(default_prosimos_event_log_column_mapping, file_path.open("w"))

        return file_path
