import { Link } from "@remix-run/react";
import { Suspense, useContext, useEffect, useState } from "react";
import type { ToastOptions } from "react-hot-toast";
import toast from "react-hot-toast";
import { UserContext } from "~/routes/contexts";
import {
  ProcessingRequestStatus,
  ProcessingRequestType,
  getProcessingRequest,
  type ProcessingRequest,
} from "~/services/processing_requests";
import { parseDate } from "~/shared/utils";
import { AssetCardAsync } from "./AssetCardAsync";

const terminalStatuses = [
  ProcessingRequestStatus.CANCELLED,
  ProcessingRequestStatus.FAILED,
  ProcessingRequestStatus.FINISHED,
];

export function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  // polling of running requests to update the status
  const user = useContext(UserContext);
  const [request_, setRequest_] = useState<ProcessingRequest | null>(request);
  useEffect(() => {
    const inTerminalState = terminalStatuses.includes(request.status);
    if (!user?.token || !request || inTerminalState) return;
    // set up polling for newly created or running processing requests
    const interval = setInterval(async () => {
      // fetch the processing request
      let requestUpdated;
      try {
        requestUpdated = await getProcessingRequest(request.id, user.token!);
      } catch (e: any) {
        throw new Error(e);
      }
      // update on change
      if (request_ && requestUpdated.status !== request_.status) {
        showToast(requestUpdated);
        setRequest_(requestUpdated);
      }
      // remove polling when done processing
      if (terminalStatuses.includes(requestUpdated.status)) clearInterval(interval);
    }, 5000);
    return () => clearInterval(interval);
  }, [request, request_, user?.token]);

  function showToast(requestUpdated: ProcessingRequest) {
    const toastMessage = `Processing request ${requestUpdated.id} is ${requestUpdated.status}`;
    const toastProps = { duration: 10000, position: "top-center" } as ToastOptions;
    if (requestUpdated.status === ProcessingRequestStatus.FINISHED) toast.success(toastMessage, toastProps);
    else if (requestUpdated.status === ProcessingRequestStatus.FAILED) toast.error(toastMessage, toastProps);
    else toast(toastMessage, { ...toastProps, icon: "👌" });
  }

  function getDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate.getTime() - startDate.getTime();
    return duration;
  }

  function formatDuration(duration: number) {
    return new Date(duration).toISOString().substr(11, 8);
  }

  function formattedDuration() {
    if (!request_) return "";
    return request_.end_time ? formatDuration(getDuration(request_.creation_time, request_.end_time)) : "";
  }

  function bgColorByStatus(status: ProcessingRequestStatus) {
    switch (status) {
      case ProcessingRequestStatus.CREATED:
        return "bg-teal-200";
      case ProcessingRequestStatus.RUNNING:
        return "bg-yellow-200 animate-pulse";
      case ProcessingRequestStatus.FINISHED:
        return "bg-green-100";
      case ProcessingRequestStatus.FAILED:
        return "bg-red-200";
      case ProcessingRequestStatus.CANCELLED:
        return "bg-gray-200";
      default:
        return "";
    }
  }

  function textColorByStatus(status: ProcessingRequestStatus) {
    switch (status) {
      case ProcessingRequestStatus.CREATED:
        return "text-teal-600";
      case ProcessingRequestStatus.RUNNING:
        return "text-yellow-600 animate-pulse";
      case ProcessingRequestStatus.FINISHED:
        return "text-green-600";
      case ProcessingRequestStatus.FAILED:
        return "text-red-600";
      case ProcessingRequestStatus.CANCELLED:
        return "text-gray-600";
      default:
        return "";
    }
  }

  if (!request_) return <></>;
  return (
    <div
      className={`flex flex-col rounded-lg p-2 border-2 break-words tracking-normal text-sm text-slate-800 bg-slate-100`}
      data-processingrequestid={request_.id}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="mb-2 last:mb-0">
          <p>Job started at {parseDate(request_.creation_time)}</p>
          <p>
            Status: <span className={`font-semibold ${textColorByStatus(request_.status)}`}>{request_.status}</span>
          </p>
          {formattedDuration() ? <p>Duration {formattedDuration()}</p> : <></>}
        </div>
        {request_.type === ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS &&
          request_.status === ProcessingRequestStatus.FINISHED && (
            <Link to={`/kronos/results/${request_.id}`} target="_blank" className="shrink w-fit">
              Open in Kronos
            </Link>
          )}
        {request_.type === ProcessingRequestType.SIMULATION_PROSIMOS &&
          request_.status === ProcessingRequestStatus.FINISHED && (
            <Link to={`/prosimos/results/${request_.id}`} target="_blank" className="shrink w-fit">
              Show simulation statistics
            </Link>
          )}
        {request_.output_assets_ids.length > 0 &&
          request_.output_assets_ids.map((assetId) => <AssetCardAsync key={assetId} assetId={assetId} user={user} />)}
      </Suspense>
    </div>
  );
}
