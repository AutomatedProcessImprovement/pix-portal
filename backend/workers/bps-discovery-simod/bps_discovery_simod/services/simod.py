import logging
import re
import subprocess
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from bps_discovery_simod.services.asset import AssetService, Asset, AssetType
from bps_discovery_simod.services.processing_request import (
    ProcessingRequestService,
    ProcessingRequest,
    ProcessingRequestStatus,
)
from bps_discovery_simod.services.project import ProjectService
from bps_discovery_simod.settings import settings

logger = logging.getLogger()


class InputAssetMissing(Exception):
    pass


class SimodDiscoveryFailed(Exception):
    pass


class SimodService:
    src_dir: Path = Path("/usr/src/Simod")
    run_sh_script: Path = src_dir / "run.sh"

    def __init__(self):
        self._assets_base_dir = settings.asset_base_dir
        self._simod_results_base_dir = settings.simod_results_base_dir
        self._asset_service = AssetService()
        self._processing_request_service = ProcessingRequestService()
        self._project_service = ProjectService()

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
            await self._processing_request_service.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.RUNNING
            )

            # download assets
            assets = [
                await self._asset_service.download_asset(asset_id, self._assets_base_dir)
                for asset_id in processing_request.input_assets_ids
            ]

            # update Simod configuration to include the correct event log path
            config_asset = self._find_asset_by_type(assets, AssetType.CONFIGURATION_SIMOD_YAML)
            event_log_asset = self._find_asset_by_type(assets, AssetType.EVENT_LOG_CSV) or self._find_asset_by_type(
                assets, AssetType.EVENT_LOG_CSV_GZ
            )
            if (
                config_asset is None
                or event_log_asset is None
                or config_asset.local_disk_path is None
                or event_log_asset.local_disk_path is None
            ):
                raise InputAssetMissing()
            self._update_configuration_file(config_asset.local_disk_path, event_log_asset.local_disk_path)

            # run Simod, it can take hours
            results_dir = self._simod_results_base_dir / processing_request.processing_request_id
            results_dir.mkdir(parents=True, exist_ok=True)
            result = _start_simod_discovery_subprocess(config_asset.local_disk_path, results_dir)
            result_stdout = result.stdout if result.stdout is not None else ""
            result_stderr = result.stderr if result.stderr is not None else ""

            # upload results and create corresponding assets
            result_dir = result.output_dir
            bpmn_path, bps_model_path = self._find_simod_results_file_paths(result_dir, event_log_asset.local_disk_path)
            bpmn_asset_id = await self._asset_service.create_asset(
                file_path=bpmn_path,
                project_id=processing_request.project_id,
                asset_type=AssetType.PROCESS_MODEL_BPMN,
                processing_requests_ids=[processing_request.processing_request_id],
            )
            bps_model_asset_id = await self._asset_service.create_asset(
                file_path=bps_model_path,
                project_id=processing_request.project_id,
                asset_type=AssetType.SIMULATION_MODEL_PROSIMOS_JSON,
                processing_requests_ids=[processing_request.processing_request_id],
            )

            # update project assets
            # NOTE: assets must be added to the project first before adding them to the processing request,
            #   because the processing request service checks if the assets belong to the project
            await self._project_service.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=bpmn_asset_id,
            )
            await self._project_service.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=bps_model_asset_id,
            )

            # update output assets in the processing request
            await self._processing_request_service.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=bpmn_asset_id,
            )
            await self._processing_request_service.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=bps_model_asset_id,
            )

            # update processing request status
            await self._processing_request_service.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.FINISHED
            )
        except Exception as e:
            trace = traceback.format_exc()
            logger.error(f"Simod discovery failed: {e}, stdout={result_stdout}, stderr={result_stderr}, trace={trace}")

            # update processing request status
            await self._processing_request_service.update_status(
                processing_request_id=processing_request.processing_request_id,
                status=ProcessingRequestStatus.FAILED,
                message=str(e),
            )

        # set token to None to force re-authentication, because the token might have expired
        self._asset_service.nullify_token()
        self._asset_service._file_service.nullify_token()
        self._project_service.nullify_token()
        self._processing_request_service.nullify_token()

    @staticmethod
    def _find_asset_by_type(assets: list[Asset], asset_type: AssetType) -> Optional[Asset]:
        for asset in assets:
            if asset.type == asset_type:
                return asset
        return None

    @staticmethod
    def _update_configuration_file(config_path: Path, event_log_path: Path):
        content = config_path.read_bytes()

        regexp = r"train_log_path: .*\n"
        replacement = f"train_log_path: {event_log_path.absolute()}\n"
        content = re.sub(regexp, replacement, content.decode("utf-8"))

        # NOTE: test log is not supported for discovery in production
        regexp = r"test_log_path: .*\n"
        replacement = "test_log_path: null\n"
        content = re.sub(regexp, replacement, content)

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
