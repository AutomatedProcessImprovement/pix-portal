import json
import logging
import shutil
import traceback
from datetime import datetime
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
from wta import EventLogIDs
from wta.cli import _column_mapping, _run

from kronos.kronos_http_client import KronosHTTPClient
from kronos.settings import settings

logger = logging.getLogger()


class InputAssetMissing(Exception):
    def __init__(self, message: Optional[str] = None):
        if message is not None:
            super().__init__(message)
        else:
            super().__init__("Input asset not found.")


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
        files_to_delete = []
        dirs_to_delete = []
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

            # get and validate input assets
            event_log_file, column_mapping_file = self._extract_input_files(assets)
            self._validate_input_files([event_log_file, column_mapping_file])

            # run Kronos, it can take time
            logger.info(
                f"Running Kronos analysis: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"column_mapping={column_mapping_file}, "
                f"event_log={event_log_file}, "
            )
            output_dir = self._kronos_results_base_dir / processing_request.processing_request_id
            dirs_to_delete.append(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            csv_output_path, json_output_path = self._run_kronos(
                event_log_path=event_log_file.path,
                column_mapping_path=column_mapping_file.path,
                output_dir=output_dir,
            )
            logger.info(
                f"Kronos analysis has finished: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"output_path={csv_output_path}, "
            )

            # upload output assets
            report_asset_id = await self._asset_service_client.create_asset(
                files=[
                    File_(
                        path=csv_output_path,
                        type=FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV,
                        name=csv_output_path.name,
                    ),
                    File_(
                        path=json_output_path,
                        type=FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON,
                        name=json_output_path.name,
                    ),
                ],
                project_id=processing_request.project_id,
                asset_name=csv_output_path.stem,
                asset_type=AssetType.KRONOS_REPORT,
                users_ids=[UUID(processing_request.user_id)],
            )
            logger.info(
                f"Kronos analysis report uploaded: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"output_path={csv_output_path}, "
                f"asset_id={report_asset_id}"
            )

            # load the results into the database using KronosHTTP
            kronos_response = await self._kronos_http_client.create_table_from_path(
                processing_request_id=processing_request.processing_request_id,
                wta_report_csv_path=csv_output_path,
            )
            if kronos_response.table_name is None:
                raise FailedCreatingTableFromCSV(kronos_response.error)
            logger.info(f"Kronos analysis uploaded to database: " f"table_name={kronos_response.table_name}")

            # NOTE: there's no public output assets from Kronos, a user is supposed to use Kronos UI instead

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
                f"Waiting time analysis with Kronos failed: {e}, "
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
            for dir in dirs_to_delete:
                shutil.rmtree(dir, ignore_errors=True)

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

        event_log_file = self._find_file_by_type(files, FileType.EVENT_LOG_CSV) or self._find_file_by_type(
            files, FileType.EVENT_LOG_CSV_GZ
        )
        event_log_column_mapping_file = self._find_file_by_type(files, FileType.EVENT_LOG_COLUMN_MAPPING_JSON)

        return event_log_file, event_log_column_mapping_file

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
    def _run_kronos(
        event_log_path: Path,
        column_mapping_path: Path,
        output_dir: Path,
    ):
        log_ids = _column_mapping(column_mapping_path, None)
        KronosService._post_process_log_ids(column_mapping_path, log_ids)

        _run(event_log_path, True, log_ids, output_dir)

        csv_output_path = (output_dir / (event_log_path.stem + "_transitions_report")).with_suffix(".csv")
        json_output_path = (output_dir / (event_log_path.stem + "_transitions_report")).with_suffix(".json")
        return csv_output_path, json_output_path

    @staticmethod
    def _post_process_log_ids(column_mapping_path: Path, log_ids: EventLogIDs):
        # WTA v1.3.8 uses "start_timestamp" and "end_timestamp" keys from the column mapping file
        # instead of "start_time" and "end_time" but uses "start_time" and "end_time" in EventLogIDs,
        # so we need to ensure the correct column names are used for start and end timestamps
        column_mapping = json.load(column_mapping_path.open("r"))
        setattr(log_ids, "start_time", column_mapping["start_time"])
        setattr(log_ids, "end_time", column_mapping["end_time"])

    async def _send_email_notification(self, processing_request: ProcessingRequest, is_success: bool):
        email_notification_producer = EmailNotificationProducer(client_id="waiting_time_analysis_kronos")
        user = await self._user_service_client.get_user(user_id=UUID(processing_request.user_id))
        try:
            user_email = str(user["email"])
        except KeyError:
            logger.error(
                f"Failed to send email notification: "
                f"processing_request_id={processing_request.processing_request_id}, "
                f"message=User email not found, "
                f"user={user}"
            )
            return
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
