import { useState } from "react";
import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets.server";
import InputAssets from "./InputAssets";
import ProcessingSetup from "./ProcessingSetup";

export default function ProcessingApp({ assets, processingType }: { assets: Asset[]; processingType: ProcessingType }) {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  return (
    <>
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <InputAssets assets={assets} selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
      </div>
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <ProcessingSetup assets={assets} processingType={processingType} selectedAssets={selectedAssets} />
      </div>
      <div className="border-2 border-red-400 px-2 py-1 bg-yellow-50">Output assets</div>
    </>
  );
}
