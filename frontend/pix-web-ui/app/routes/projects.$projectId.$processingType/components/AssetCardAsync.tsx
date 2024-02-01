import { useEffect, useState } from "react";
import type { Asset } from "~/services/assets";
import { getAsset } from "~/services/assets";
import type { User } from "~/services/auth";
import { AssetCard } from "./AssetCard";

export function AssetCardAsync({ assetId, user }: { assetId: string; user: User | null }) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!user) return;
    getAsset(assetId, user.token!).then((asset) => {
      if (asset.deletion_time !== null) return;
      setAsset(asset);
    });
  }, [assetId, user]);

  return <>{asset && <AssetCard asset={asset} isActive={false} isRemoveAvailable={false} isInteractive={false} />}</>;
}
