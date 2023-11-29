import { useContext } from "react";
import UploadAssetButton from "~/components/asset-upload/UploadAssetButton";
import UploadAssetDialog from "~/components/asset-upload/UploadAssetDialog";
import type { Asset, AssetType } from "~/services/assets";
import { processingTypeToAssetType } from "~/shared/processing_type";
import { AssetsContext, SelectedAssetsContext } from "./contexts";
import { useProcessingType } from "./useProcessingType";

export default function InputAssets({ setSelectedAssets }: { setSelectedAssets: (assets: Asset[]) => void }) {
  const processingType = useProcessingType();
  const assets = useContext(AssetsContext);
  const selectedAssets = useContext(SelectedAssetsContext);

  function handleClick(asset: Asset) {
    // allow only one asset of each type to be selected at the same time

    if (selectedAssets.includes(asset)) {
      // if the asset is already selected, deselect it
      setSelectedAssets([...filterOutAssetType(selectedAssets, asset.type as AssetType)]);
    } else {
      setSelectedAssets([...filterOutAssetType(selectedAssets, asset.type as AssetType), asset]);
    }
  }

  return (
    <div className="flex flex-col items-center p-2 space-y-2">
      <h2 className="text-2xl font-semibold">Input Assets</h2>
      {assets.sort().map((asset: Asset) => (
        <div
          key={asset.id}
          className={`break-all px-2 bg-teal-200 ${
            selectedAssets.includes(asset) ? "bg-teal-400 border-2 border-teal-800" : ""
          }`}
          onClick={() => handleClick(asset)}
        >
          {asset.name}
        </div>
      ))}
      <UploadAssetDialog trigger={<UploadAssetButton />} initialAssetType={processingTypeToAssetType(processingType)} />
    </div>
  );
}

function filterOutAssetType(assets: Asset[], assetType: AssetType) {
  return assets.filter((asset) => asset.type !== assetType);
}
