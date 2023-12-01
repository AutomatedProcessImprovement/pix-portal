import { Suspense } from "react";
import type { ProcessingRequest } from "~/services/processing_requests";
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
    <div className="px-2 flex flex-col break-words">
      <Suspense fallback={<div>Loading...</div>}>
        {parseDate(request.creation_time)}
        {request.end_time ? "–" + parseDate(request.end_time!) : ""}: {request.status}{" "}
        {duration ? `in ${duration}` : ""}
      </Suspense>
    </div>
  );
}
