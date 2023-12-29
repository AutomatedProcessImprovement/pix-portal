import { useContext } from "react";
import type { ProcessingRequest } from "~/services/processing_requests";
import { ProcessingRequestStatus } from "~/services/processing_requests";
import { AssetCardAsync } from "./AssetCardAsync";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { ProcessingRequestCard } from "./ProcessingRequestCard";
import { UserContext } from "./contexts";

export default function OutputAssets({ processingRequests }: { processingRequests: ProcessingRequest[] }) {
  const user = useContext(UserContext);

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
    <ProcessingAppSection>
      <h2 className="text-xl text-slate-500 font-semibold mb-6">Output Assets</h2>
      {processingRequests.length > 0 && (
        <div className="mb-6 space-y-2">
          {processingRequests.sort(byCreationTime).map((request: ProcessingRequest) => (
            <div
              key={request.id}
              className={`flex flex-col border-2 border-teal-800 ${classNamesGivenStatus(request.status)}`}
            >
              <ProcessingRequestCard request={request} />
              {request.output_assets_ids.length > 0 &&
                request.output_assets_ids.map((assetId) => (
                  <AssetCardAsync key={assetId} assetId={assetId} user={user} />
                ))}
            </div>
          ))}
        </div>
      )}
    </ProcessingAppSection>
  );
}
