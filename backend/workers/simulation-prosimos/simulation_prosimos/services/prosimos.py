import logging
import traceback
from pathlib import Path
from typing import Optional

import yaml
from pix_portal_lib.services.asset import AssetService, AssetType, Asset
from prosimos.simulation_engine import run_simulation

from simulation_prosimos.settings import settings
from .processing_request import ProcessingRequestService, ProcessingRequest, ProcessingRequestStatus
from .project import ProjectService

logger = logging.getLogger()


class InputAssetMissing(Exception):
    pass


class ProsimosSimulationFailed(Exception):
    pass


class ProsimosService:
    def __init__(self):
        self._assets_base_dir = settings.asset_base_dir
        self._prosimos_results_base_dir = settings.prosimos_results_base_dir
        self._asset_service = AssetService()
        self._processing_request_service = ProcessingRequestService()
        self._project_service = ProjectService()

        self._assets_base_dir.mkdir(parents=True, exist_ok=True)
        self._prosimos_results_base_dir.mkdir(parents=True, exist_ok=True)

    async def process(self, processing_request: ProcessingRequest):
        """
        Downloads the input assets, runs Prosimos, and uploads the output assets
        while updating all the dependent services if new assets have been produced.
        """
        try:
            # update processing request status
            await self._processing_request_service.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.RUNNING
            )

            # download assets
            assets = [
                await self._asset_service.download_asset(asset_id, self._assets_base_dir, is_internal=True)
                for asset_id in processing_request.input_assets_ids
            ]

            # get and validate input assets
            config_asset = self._find_asset_by_type(assets, AssetType.CONFIGURATION_PROSIMOS_YAML)
            bpmn_asset = self._find_asset_by_type(assets, AssetType.PROCESS_MODEL_BPMN)
            simulation_model_asset = self._find_asset_by_type(assets, AssetType.SIMULATION_MODEL_PROSIMOS_JSON)
            if config_asset is None or bpmn_asset is None:
                raise InputAssetMissing()

            # run Prosimos, it can take time
            output_path = self._prosimos_results_base_dir / f"{processing_request.processing_request_id}.csv"
            self._run_prosimos(
                bpmn_path=bpmn_asset.local_disk_path,
                bps_model_path=simulation_model_asset.local_disk_path,
                config_path=config_asset.local_disk_path,
                output_path=output_path,
            )

            # upload results and create corresponding assets
            synthetic_event_log_asset_id = await self._asset_service.create_asset(
                file_path=output_path,
                project_id=processing_request.project_id,
                asset_type=AssetType.EVENT_LOG_CSV,
            )

            # update project assets
            # NOTE: assets must be added to the project first before adding them to the processing request,
            #   because the processing request service checks if the assets belong to the project
            await self._project_service.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=synthetic_event_log_asset_id,
            )

            # update output assets in the processing request
            await self._processing_request_service.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=synthetic_event_log_asset_id,
            )

            # update processing request status
            await self._processing_request_service.update_status(
                processing_request_id=processing_request.processing_request_id, status=ProcessingRequestStatus.FINISHED
            )
        except Exception as e:
            trace = traceback.format_exc()
            logger.error(
                f"Prosimos simulation failed: {e}, "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"trace={trace}"
            )

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
    def _run_prosimos(
        bpmn_path: Path,
        bps_model_path: Path,
        config_path: Path,
        output_path: Path,
    ):
        config = yaml.load(config_path.read_bytes(), Loader=yaml.FullLoader)
        total_cases = config["total_cases"]
        starting_at = config["starting_at"]
        is_event_added_to_log = config["is_event_added_to_log"]

        run_simulation(
            bpmn_path=bpmn_path,
            json_path=bps_model_path,
            total_cases=total_cases,
            log_out_path=output_path,
            starting_at=str(starting_at),
            is_event_added_to_log=is_event_added_to_log,
        )
