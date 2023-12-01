import { useContext } from "react";
import UploadAssetButton from "~/components/asset-upload/UploadAssetButton";
import UploadAssetDialog from "~/components/asset-upload/UploadAssetDialog";
import type { Asset, AssetType } from "~/services/assets";
import { processingTypeToAssetType } from "~/shared/processing_type";
import { AssetCard } from "./AssetCard";
import { ProcessingAppSection } from "./ProcessingAppSection";
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
    <ProcessingAppSection>
      <h2 className="text-xl text-slate-500 font-semibold">Input Assets</h2>
      {assets.sort().map((asset: Asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isActive={selectedAssets.includes(asset)}
          onClick={() => {
            console.log("clicked asset", asset);
            handleClick(asset);
          }}
        />
      ))}
      <UploadAssetDialog trigger={<UploadAssetButton />} initialAssetType={processingTypeToAssetType(processingType)} />
    </ProcessingAppSection>
  );
}

function filterOutAssetType(assets: Asset[], assetType: AssetType) {
  return assets.filter((asset) => asset.type !== assetType);
}
