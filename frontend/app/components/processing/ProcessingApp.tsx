import { useState } from "react";
import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets.server";
import { ProcessingRequest } from "~/services/processing_requests";
import AssetsInput from "./AssetsInput";
import AssetsOutput from "./AssetsOutput";
import ProcessingSetup from "./ProcessingSetup";

export default function ProcessingApp({
  assets,
  processingType,
  processingRequests,
  user,
}: {
  assets: Asset[];
  processingType: ProcessingType;
  processingRequests: ProcessingRequest[];
  user: any;
}) {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  return (
    <>
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <AssetsInput
          assets={assets}
          selectedAssets={selectedAssets}
          setSelectedAssets={setSelectedAssets}
          processingType={processingType}
        />
      </div>
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <ProcessingSetup assets={assets} processingType={processingType} selectedAssets={selectedAssets} />
      </div>
      <div className="border-2 border-red-400 px-2 py-1 bg-yellow-50">
        <AssetsOutput processingRequests={processingRequests} user={user} />
      </div>
    </>
  );
}
