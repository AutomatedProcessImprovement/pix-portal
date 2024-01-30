import { Popover } from "@headlessui/react";
import { ArrowDownTrayIcon, BarsArrowDownIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useContext } from "react";
import { UserContext } from "~/routes/contexts";
import { type Asset } from "~/services/assets";
import { FileType } from "~/services/files";
import { removeAssetFromProject } from "~/services/projects";
import { parseDate } from "~/shared/utils";
import { useAssetFile } from "./useAssetFile";
import { useDownloadProps } from "./useDownloadProps";

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
      data-assetid={asset.id}
    >
      <div
        className={`flex flex-grow flex-col justify-between space-y-2 leading-normal text-slate-900 ${
          rest.className ? rest.className : ""
        }`}
      >
        <div className="flex justify-between">
          <h5 className="pl-2 pt-2 pr-1 font-semibold tracking-normal text-sm text-slate-900 break-all">
            {asset.name}
          </h5>
          <div className="flex">
            <AssetFilesDropdown asset={asset} className="py-1 px-0.5 pt-1.5" />
            <RemoveAssetButton asset={asset} className="py-1 px-0.5 pt-1.5" />
          </div>
        </div>
        <div className="px-2 pb-2 flex space-x-2 font-normal text-slate-400 text-xs">
          <p className="">{parseDate(asset.creation_time)}</p>
          <p className="">{asset.type}</p>
        </div>
      </div>
    </div>
  );
}

function RemoveAssetButton({ asset, ...rest }: { asset: Asset } & React.HTMLAttributes<HTMLDivElement>) {
  const user = useContext(UserContext);

  async function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Are you sure you want to remove this asset?")) return;
    await removeAssetFromProject(asset.id, asset.project_id, user.token!);
    // refresh page
    window.location.reload();
  }

  return (
    <div className={`${rest.className ? rest.className : ""}`} onClick={handleClick}>
      <div
        className={`z-0 w-6 h-6 flex items-center place-content-center rounded-full text-slate-400 hover:text-red-500 border-2 border-slate-200 bg-white hover:bg-slate-100`}
      >
        <TrashIcon className="w-4 " />
      </div>
    </div>
  );
}

function AssetFilesDropdown({ asset, ...rest }: { asset: Asset } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`static ${rest.className ? rest.className : ""}`} onClick={(e) => e.stopPropagation()}>
      <Popover>
        <Popover.Button
          className={
            "z-0 p-0 m-0 w-6 h-6 flex items-center place-content-center rounded-full text-slate-400 hover:text-slate-500 border-2 border-slate-200 bg-white hover:bg-slate-100"
          }
        >
          <BarsArrowDownIcon className="w-4 " />
        </Popover.Button>
        <Popover.Panel className="mt-1 shadow-xl z-10 bg-white border-2 border-slate-200 rounded-lg absolute flex flex-col">
          {asset.files_ids.map((fileId) => (
            <AssetFileAsync key={fileId} assetId={asset.id} fileId={fileId} />
          ))}
        </Popover.Panel>
      </Popover>
    </div>
  );
}

function AssetFileAsync({ assetId, fileId }: { assetId: string; fileId: string }) {
  const user = useContext(UserContext);
  const { file, fileLocation } = useAssetFile(assetId, fileId, user!);
  const { downloadUrl, hiddenAnchorRef, handleClick } = useDownloadProps(fileLocation, user);

  return (
    <div className="cursor-pointer hover:bg-slate-100 prose prose-sm prose-slate px-2 border-b-2 last:border-none border-slate-200">
      {file && fileLocation && (
        <>
          <div className="flex items-center" title="Download file">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <div onClick={handleClick} className="flex flex-col p-2">
              <span className="font-semibold">{file.name}</span>
              <span className="text-xs text-slate-400 tracking-wide">{formatFileType(file.type as FileType)}</span>
            </div>
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              ref={hiddenAnchorRef}
              download={file.name}
              className="hidden"
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          )}
        </>
      )}
      {!file && !fileLocation && <span>Loading...</span>}
    </div>
  );
}

function formatFileType(fileType: FileType) {
  switch (fileType) {
    case FileType.EVENT_LOG_CSV:
      return "Event Log";
    case FileType.EVENT_LOG_CSV_GZ:
      return "Event Log";
    case FileType.EVENT_LOG_COLUMN_MAPPING_JSON:
      return "Column Mapping";
    case FileType.PROCESS_MODEL_BPMN:
      return "Process Model";
    case FileType.CONFIGURATION_SIMOD_YAML:
      return "Discovery Configuration";
    case FileType.SIMULATION_MODEL_PROSIMOS_JSON:
      return "Simulation Model";
    case FileType.STATISTICS_PROSIMOS_CSV:
      return "Simulation Statistics";
    case FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON:
      return "Optimizer Model";
    case FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON:
      return "Waiting Time Report (JSON)";
    case FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV:
      return "Waiting Time Report (CSV)";
  }
}
