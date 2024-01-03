import { Link } from "@remix-run/react";
import { Suspense } from "react";
import { ProcessingRequestType, type ProcessingRequest } from "~/services/processing_requests";
import { parseDate } from "~/shared/utils";

export function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  function getDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate.getTime() - startDate.getTime();
    return duration;
  }

  function formatDuration(duration: number) {
    return new Date(duration).toISOString().substr(11, 8);
  }

  const duration = request.end_time ? formatDuration(getDuration(request.creation_time, request.end_time)) : "";

  return (
    <div className="p-2 flex flex-col break-words tracking-normal text-sm text-slate-900">
      <Suspense fallback={<div>Loading...</div>}>
        <div>Started: {parseDate(request.creation_time)}</div>
        <div>
          Status: <span className="font-semibold">{request.status}</span>
        </div>
        {duration ? <div>Duration {duration}</div> : <></>}
        {request.type === ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS && (
          <Link to={`/kronos/results/${request.id}`} target="_blank" className="shrink w-fit">
            Switch to Kronos
          </Link>
        )}
      </Suspense>
    </div>
  );
}
