import { useState } from "react";
import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets";
import { ProcessingRequest } from "~/services/processing_requests";
import AssetsInput from "./AssetsInput";
import AssetsOutput from "./AssetsOutput";
import ProcessingSetup from "./ProcessingSetup";
import { SelectedAssetsContext } from "./contexts";

export default function ProcessingApp({
  assets,
  processingType,
  processingRequests,
}: {
  assets: Asset[];
  processingType: ProcessingType;
  processingRequests: ProcessingRequest[];
}) {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  return (
    <>
      <SelectedAssetsContext.Provider value={selectedAssets}>
        <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
          <AssetsInput
            assets={assets}
            selectedAssets={selectedAssets}
            setSelectedAssets={setSelectedAssets}
            processingType={processingType}
          />
        </div>
        <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
          <ProcessingSetup processingType={processingType} />
        </div>
        <div className="border-2 border-red-400 px-2 py-1 bg-yellow-50">
          <AssetsOutput processingRequests={processingRequests}/>
        </div>
      </SelectedAssetsContext.Provider>
    </>
  );
}
