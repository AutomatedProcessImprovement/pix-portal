import { Suspense, useEffect, useState } from "react";
import { getAsset } from "~/services/assets";
import { Asset } from "~/services/assets.server";
import { User } from "~/services/auth.server";
import { ProcessingRequest, ProcessingRequestStatus } from "~/services/processing_requests";

export default function OutputAssets({
  processingRequests,
  user,
}: {
  processingRequests: ProcessingRequest[];
  user: User;
}) {
  const assets: Asset[] = [];

  function byCreationTime(a: ProcessingRequest, b: ProcessingRequest) {
    return a.creation_time.localeCompare(b.creation_time);
  }

  return (
    <div className="flex flex-col items-center p-2 space-y-2">
      <h2 className="text-xl font-semibold">Output Assets</h2>
      {processingRequests.sort(byCreationTime).map((request: ProcessingRequest) => (
        <div key={request.id} className="flex flex-col">
          <ProcessingRequestCard request={request} />
          {request.output_assets_ids.length > 0 &&
            request.output_assets_ids.map((assetId) => <AssetCard key={assetId} assetId={assetId} user={user} />)}
        </div>
      ))}
    </div>
  );
}

function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  function classNamesGivenStatus(status: ProcessingRequestStatus) {
    switch (status) {
      case ProcessingRequestStatus.CREATED:
        return "bg-teal-200";
      case ProcessingRequestStatus.RUNNING:
        return "bg-yellow-200 animate-pulse";
      case ProcessingRequestStatus.FINISHED:
        return "bg-green-200";
      case ProcessingRequestStatus.FAILED:
        return "bg-red-200";
      case ProcessingRequestStatus.CANCELLED:
        return "bg-gray-200";
      default:
        return "";
    }
  }

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

  function fetchAssets(request: ProcessingRequest, token: string) {
    let promises = request.output_assets_ids.map((assetId) => getAsset(assetId, token));
    return Promise.all(promises);
  }

  return (
    <div className={`px-2 ${classNamesGivenStatus(request.status)} flex flex-col`}>
      <Suspense fallback={<div>Loading...</div>}>
        {parseDate(request.creation_time)}
        {request.end_time ? "-- " + parseDate(request.end_time!) : ""}: {request.status}
      </Suspense>
    </div>
  );
}

function AssetCard({ assetId, user }: { assetId: string; user: User }) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    getAsset(assetId, user.token!).then((asset) => {
      setAsset(asset);
    });
  }, [assetId]);

  return (
    <div className={`px-2 bg-teal-200 `}>
      {asset && (
        <div className="flex flex-col">
          <div className="font-bold">{asset.name}</div>
          <div>{asset.type}</div>
        </div>
      )}
    </div>
  );
}
