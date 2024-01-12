import { Link } from "@remix-run/react";
import { Suspense, useContext, useEffect, useState } from "react";
import { UserContext } from "~/routes/contexts";
import {
  ProcessingRequestStatus,
  ProcessingRequestType,
  getProcessingRequest,
  type ProcessingRequest,
} from "~/services/processing_requests";
import { parseDate } from "~/shared/utils";

const terminalStatuses = [
  ProcessingRequestStatus.CANCELLED,
  ProcessingRequestStatus.FAILED,
  ProcessingRequestStatus.FINISHED,
];

export function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  // periodic fetch of the running requests to update the status
  const user = useContext(UserContext);
  const [requestData, setRequestData] = useState<ProcessingRequest | null>(request);
  useEffect(() => {
    const inTerminalState = terminalStatuses.includes(request.status);
    if (!user?.token || !request || inTerminalState) return;
    const interval = setInterval(async () => {
      const requestData = await getProcessingRequest(request.id, user.token!);
      setRequestData(requestData);
      if (terminalStatuses.includes(requestData.status)) clearInterval(interval);
    }, 5000);
    return () => clearInterval(interval);
  }, [request, user?.token]);

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
    if (!requestData) return "";
    return requestData.end_time ? formatDuration(getDuration(requestData.creation_time, requestData.end_time)) : "";
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

  if (!requestData) return <></>;
  return (
    <div
      className={`p-2 flex flex-col break-words tracking-normal text-sm text-slate-900 ${bgColorByStatus(
        requestData.status
      )}`}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div>Started: {parseDate(requestData.creation_time)}</div>
        <div>
          Status: <span className="font-semibold">{requestData.status}</span>
        </div>
        {formattedDuration() ? <div>Duration {formattedDuration()}</div> : <></>}
        {requestData.type === ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS &&
          requestData.status === ProcessingRequestStatus.FINISHED && (
            <Link to={`/kronos/results/${requestData.id}`} target="_blank" className="shrink w-fit">
              Open in Kronos
            </Link>
          )}
      </Suspense>
    </div>
  );
}
