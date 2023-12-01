import type { Asset } from "~/services/assets";
import { parseDate } from "~/shared/utils";

export function AssetCard({
  asset,
  isActive,
  isInteractive = true,
  ...rest
}: { asset: Asset; isActive: boolean; isInteractive?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  const restWithoutClassName = { ...rest };
  delete restWithoutClassName.className;

  if (!isInteractive) {
    delete restWithoutClassName.onClick;
  }

  return (
    <div
      className={`flex flex-col rounded-lg shadow border-2 ${
        isInteractive ? "cursor-pointer hover:bg-slate-100" : ""
      } ${isActive ? "bg-slate-100 border-blue-400" : "bg-white border-slate-100"}`}
      {...restWithoutClassName}
    >
      <div
        className={`flex flex-grow flex-col justify-between p-4 space-y-2 leading-normal text-slate-900 ${
          rest.className ? rest.className : ""
        }`}
      >
        <h5 className="font-semibold tracking-normal text-sm text-slate-900 break-all">{asset.name}</h5>
        <div className="flex space-x-2 font-normal text-slate-400 text-xs">
          <p className="">{parseDate(asset.creation_time)}</p>
          <p className="">{asset.type}</p>
        </div>
      </div>
    </div>
  );
}
