import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";
import UploadAssetButton from "../UploadAssetButton";
import UploadAssetDialog from "../upload/UploadAssetDialog";

export default function AssetsInput({
  assets,
  selectedAssets,
  setSelectedAssets,
}: {
  assets: Asset[];
  selectedAssets: Asset[];
  setSelectedAssets: (assets: Asset[]) => void;
}) {
  function handleClick(asset: Asset) {
    // allow only one asset of each type to be selected at the same time

    if (selectedAssets.includes(asset)) {
      // if the asset is already selected, deselect it
      setSelectedAssets([...filterOutAssetType(selectedAssets, asset.type as AssetTypeBackend)]);
    } else {
      setSelectedAssets([...filterOutAssetType(selectedAssets, asset.type as AssetTypeBackend), asset]);
    }
  }

  return (
    <div className="flex flex-col items-center p-2 space-y-2">
      <h2 className="text-xl font-semibold">Input Assets</h2>
      {assets.sort().map((asset: Asset) => (
        <div
          key={asset.id}
          className={`px-2 bg-teal-200 ${selectedAssets.includes(asset) ? "bg-teal-400 border-2 border-teal-800" : ""}`}
          onClick={() => {
            handleClick(asset);
          }}
        >
          {asset.name}
        </div>
      ))}
      <UploadAssetDialog trigger={<UploadAssetButton />} />
    </div>
  );
}

function filterOutAssetType(assets: Asset[], assetType: AssetTypeBackend) {
  return assets.filter((asset) => asset.type !== assetType);
}
