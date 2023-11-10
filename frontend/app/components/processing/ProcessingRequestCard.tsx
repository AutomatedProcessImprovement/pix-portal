import { Suspense } from "react";
import { ProcessingRequest } from "~/services/processing_requests";

export function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  function parseDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-EE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  return (
    <div className={`px-2 flex flex-col`}>
      <Suspense fallback={<div>Loading...</div>}>
        {parseDate(request.creation_time)}
        {request.end_time ? "-- " + parseDate(request.end_time!) : ""}: {request.status}
      </Suspense>
    </div>
  );
}
