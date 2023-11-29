import { useState } from "react";
import type { Asset } from "~/services/assets";
import type { ProcessingRequest } from "~/services/processing_requests";
import type { ProcessingType } from "~/shared/processing_type";
import InputAssets from "./InputAssets";
import OutputAssets from "./OutputAssets";
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
        <section className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
          <InputAssets assets={assets} selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
        </section>
        <section className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
          <ProcessingSetup processingType={processingType} />
        </section>
        <section className="border-2 border-red-400 px-2 py-1 bg-yellow-50">
          <OutputAssets processingRequests={processingRequests} />
        </section>
      </SelectedAssetsContext.Provider>
    </>
  );
}
