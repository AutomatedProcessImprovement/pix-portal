import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

export default function InputAssets({ assets, processingType }: { assets: Asset[]; processingType: ProcessingType }) {
  assets = filterAssetsByType(assets, processingType);

  return (
    <div className="flex flex-col p-2 space-y-2">
      {assets.map((asset: Asset) => (
        <div key={asset.id} className="px-2 bg-teal-200">
          {asset.name}
        </div>
      ))}
    </div>
  );
}

function filterAssetsByType(assets: Asset[], processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return assets.filter(
        (asset) => asset.type === AssetTypeBackend.EVENT_LOG || asset.type === AssetTypeBackend.PROCESS_MODEL
      );
    case ProcessingType.Simulation:
      return assets.filter((asset) => asset.type === AssetTypeBackend.SIMULATION_MODEL);
    case ProcessingType.WaitingTime:
      return assets.filter((asset) => asset.type === AssetTypeBackend.EVENT_LOG);
    default:
      throw new Error("Invalid processing type");
  }
}
