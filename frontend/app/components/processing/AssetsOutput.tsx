import { User } from "~/services/auth.server";
import { ProcessingRequest, ProcessingRequestStatus } from "~/services/processing_requests";
import { AssetCardAsync } from "./AssetCardAsync";
import { ProcessingRequestCard } from "./ProcessingRequestCard";

export default function AssetsOutput({
  processingRequests,
  user,
}: {
  processingRequests: ProcessingRequest[];
  user: User;
}) {
  function byCreationTime(a: ProcessingRequest, b: ProcessingRequest) {
    return a.creation_time.localeCompare(b.creation_time);
  }

  function classNamesGivenStatus(status: ProcessingRequestStatus) {
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

  return (
    <div className="flex flex-col items-center p-2 space-y-2">
      <h2 className="text-xl font-semibold">Output Assets</h2>
      {processingRequests.sort(byCreationTime).map((request: ProcessingRequest) => (
        <div
          key={request.id}
          className={`flex flex-col border-2 border-teal-800 ${classNamesGivenStatus(request.status)}`}
        >
          <ProcessingRequestCard request={request} />
          {request.output_assets_ids.length > 0 &&
            request.output_assets_ids.map((assetId) => <AssetCardAsync key={assetId} assetId={assetId} user={user} />)}
        </div>
      ))}
    </div>
  );
}