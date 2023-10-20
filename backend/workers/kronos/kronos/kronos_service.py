import logging
import traceback
from pathlib import Path
from typing import Optional
from uuid import UUID

from pix_portal_lib.kafka_clients.email_producer import EmailNotificationProducer, EmailNotificationRequest
from pix_portal_lib.service_clients.asset import AssetServiceClient, AssetType, Asset
from pix_portal_lib.service_clients.processing_request import (
    ProcessingRequestServiceClient,
    ProcessingRequest,
    ProcessingRequestStatus,
)
from pix_portal_lib.service_clients.project import ProjectServiceClient
from pix_portal_lib.service_clients.user import UserServiceClient
from wta.cli import _column_mapping, _run

from kronos.kronos_http_client import KronosHTTPClient
from kronos.settings import settings

logger = logging.getLogger()


class InputAssetMissing(Exception):
    pass


class FailedCreatingTableFromCSV(Exception):
    def __init__(self, error: str):
        super().__init__(error)
        self.error = error


class KronosService:
    def __init__(self):
        self._assets_base_dir = settings.asset_base_dir
        self._kronos_results_base_dir = settings.kronos_results_base_dir
        self._asset_service_client = AssetServiceClient()
        self._processing_request_service_client = ProcessingRequestServiceClient()
        self._project_service_client = ProjectServiceClient()
        self._user_service_client = UserServiceClient()
        self._kronos_http_client = KronosHTTPClient()

        self._assets_base_dir.mkdir(parents=True, exist_ok=True)
        self._kronos_results_base_dir.mkdir(parents=True, exist_ok=True)

    async def process(self, processing_request: ProcessingRequest):
        """
        Downloads the input assets, runs Kronos (WTA), and uploads the output assets
        while updating all the dependent services if new assets have been produced.
        """
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

            # get and validate input assets
            event_log = self._find_asset_by_type(assets, AssetType.EVENT_LOG_CSV) or self._find_asset_by_type(
                assets, AssetType.EVENT_LOG_CSV_GZ
            )
            column_mapping = self._find_asset_by_type(assets, AssetType.EVENT_LOG_COLUMN_MAPPING_JSON)
            if (
                event_log is None
                or column_mapping is None
                or event_log.local_disk_path is None
                or column_mapping.local_disk_path is None
            ):
                raise InputAssetMissing()

            # run Kronos, it can take time
            logger.info(
                f"Running Kronos analysis: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"column_mapping={column_mapping}, "
                f"event_log={event_log}, "
            )
            output_dir = self._kronos_results_base_dir / processing_request.processing_request_id
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self._run_kronos(
                event_log_path=event_log.local_disk_path,
                column_mapping_path=column_mapping.local_disk_path,
                output_dir=output_dir,
            )
            logger.info(
                f"Kronos analysis has finished: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"output_path={output_path}, "
            )

            # load the results into the database using KronosHTTP
            kronos_response = await self._kronos_http_client.create_table_from_path(
                processing_request_id=processing_request.processing_request_id,
                wta_report_csv_path=output_path,
            )
            if kronos_response.table_name is None:
                raise FailedCreatingTableFromCSV(kronos_response.error)
            logger.info(f"Kronos analysis uploaded to database: " f"table_name={kronos_response.table_name}")

            # upload results and create corresponding assets
            wta_analysis_asset_id = await self._asset_service_client.create_asset(
                file_path=output_path,
                project_id=processing_request.project_id,
                asset_type=AssetType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV,
            )

            # update project assets
            # NOTE: assets must be added to the project first before adding them to the processing request,
            #   because the processing request service checks if the assets belong to the project
            await self._project_service_client.add_asset_to_project(
                project_id=processing_request.project_id,
                asset_id=wta_analysis_asset_id,
            )

            # update output assets in the processing request
            await self._processing_request_service_client.add_output_asset_to_processing_request(
                processing_request_id=processing_request.processing_request_id,
                asset_id=wta_analysis_asset_id,
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
                f"Waiting time analysis with Kronos failed: {e}, "
                f"processing_request_id={processing_request.processing_request_id}, "
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
                await self._send_email_notification(processing_request, is_success=False)

        # set token to None to force re-authentication, because the token might have expired
        self._asset_service_client.nullify_token()
        self._asset_service_client._file_service.nullify_token()
        self._project_service_client.nullify_token()
        self._processing_request_service_client.nullify_token()

    @staticmethod
    def _find_asset_by_type(assets: list[Asset], asset_type: AssetType) -> Optional[Asset]:
        for asset in assets:
            if asset.type == asset_type:
                return asset
        return None

    @staticmethod
    def _run_kronos(
        event_log_path: Path,
        column_mapping_path: Path,
        output_dir: Path,
    ):
        log_ids = _column_mapping(column_mapping_path, None)
        _run(event_log_path, True, log_ids, output_dir)
        output_path = (output_dir / (event_log_path.stem + "_transitions_report")).with_suffix(".csv")
        return output_path

    async def _send_email_notification(self, processing_request: ProcessingRequest, is_success: bool):
        email_notification_producer = EmailNotificationProducer(client_id="waiting_time_analysis_kronos")
        user = await self._user_service_client.get_user(user_id=UUID(processing_request.user_id))
        user_email = str(user["email"])
        if is_success:
            # TODO: improve message bodies to add more details and links to output assets in all workers
            msg = EmailNotificationRequest(
                processing_request_id=processing_request.processing_request_id,
                to_addrs=[user_email],
                subject="[PIX Notification] Waiting time analysis is ready",
                body=f"Processing request {processing_request.processing_request_id} has finished successfully.",
            )
        else:
            msg = EmailNotificationRequest(
                processing_request_id=processing_request.processing_request_id,
                to_addrs=[user_email],
                subject="[PIX Notification] Waiting time analysis has failed",
                body=f"Processing request {processing_request.processing_request_id} has failed.",
            )
        email_notification_producer.send_message(msg)
