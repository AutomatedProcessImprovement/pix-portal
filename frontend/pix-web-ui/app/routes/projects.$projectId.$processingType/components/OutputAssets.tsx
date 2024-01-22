import { Link } from "@remix-run/react";
import { useContext } from "react";
import { UserContext } from "~/routes/contexts";
import { ProcessingRequestStatus, ProcessingRequestType, type ProcessingRequest } from "~/services/processing_requests";
import { AssetCardAsync } from "./AssetCardAsync";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { ProcessingRequestCard } from "./ProcessingRequestCard";

export default function OutputAssets({ processingRequests }: { processingRequests: ProcessingRequest[] }) {
  const user = useContext(UserContext);

  function byCreationTime(a: ProcessingRequest, b: ProcessingRequest) {
    return a.creation_time.localeCompare(b.creation_time);
  }

  return (
    <ProcessingAppSection>
      <h2 className="text-xl text-slate-500 font-semibold mb-6">Output Assets</h2>
      {processingRequests.length > 0 && (
        <div className="mb-6 space-y-2">
          {processingRequests.sort(byCreationTime).map((request: ProcessingRequest) => (
            <div key={request.id} className={`flex flex-col border-2 border-teal-800`}>
              <ProcessingRequestCard request={request} />
            </div>
          ))}
        </div>
      )}
    </ProcessingAppSection>
  );
}
