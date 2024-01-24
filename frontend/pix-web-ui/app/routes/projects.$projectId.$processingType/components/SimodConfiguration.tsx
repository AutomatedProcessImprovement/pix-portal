import type { Asset } from "~/services/assets";
import { AssetCard } from "./AssetCard";

export function SimodConfiguration({ eventLog, processModel }: { eventLog: Asset; processModel: Asset | null }) {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-4 border-slate-200 bg-slate-50 rounded-xl">
      <AssetCard asset={eventLog} isActive={false} isInteractive={false} />
      {processModel && <AssetCard asset={processModel} isActive={false} isInteractive={false} />}
    </div>
  );
}
