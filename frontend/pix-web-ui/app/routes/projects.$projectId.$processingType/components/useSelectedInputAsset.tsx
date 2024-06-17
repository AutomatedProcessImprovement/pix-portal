import { useContext, useEffect, useState } from "react";
import type { Asset, AssetType } from "~/services/assets";
import { SelectedAssetsContext, SetSelectedAssetsContext } from "../contexts";

export function useSelectedInputAsset(assetType: AssetType) {
  const selectedAssets = useContext(SelectedAssetsContext);
  const [asset, setAsset] = useState<Asset | null>(null);
  useEffect(() => {
    setAsset(selectedAssets.find((asset) => asset.type === assetType) || null);
  }, [selectedAssets, assetType]);
  return [asset, setAsset] as const;
}

export function useSelectAsset() {
  const selectedAssets = useContext(SelectedAssetsContext);
  const setSelectedAssets = useContext(SetSelectedAssetsContext);
  return (asset: Asset) => {
    setSelectedAssets([...selectedAssets, asset]);
  };
}
