import { Popover } from "@headlessui/react";
import { ArrowDownTrayIcon, BarsArrowDownIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import { usePopper } from "react-popper";
import { UserContext } from "~/routes/contexts";
import type { Asset, AssetType } from "~/services/assets";
import { assetTypeToString } from "~/services/assets";
import { fileTypeToString, type FileType } from "~/services/files";
import { removeAssetFromProject } from "~/services/projects";
import { parseDate } from "~/shared/utils";
import { useAssetFile } from "../hooks/useAssetFile";
import { useDownloadProps } from "./useDownloadProps";

export function AssetCard({
  asset,
  isActive,
  isInteractive = true,
  isRemoveAvailable = true,
  ...rest
}: {
  asset: Asset;
  isActive: boolean;
  isInteractive?: boolean;
  isRemoveAvailable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const restWithoutClassName = { ...rest };
  delete restWithoutClassName.className;

  if (!isInteractive) {
    delete restWithoutClassName.onClick;
  }

  const [creationTime, setCreationTime] = useState(asset.creation_time);
  useEffect(() => {
    setCreationTime(parseDate(asset.creation_time));
  }, [asset]);

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
            {!asset.deletion_time && asset.name}
            {asset.deletion_time && (
              <>
                <span title="The asset has been removed" className="line-through text-slate-400">
                  {asset.name}
                </span>
                <span className="ml-1 text-slate-900 font-semibold">(removed)</span>
              </>
            )}
          </h5>
          <div className="flex">
            {!asset.deletion_time && <AssetFilesDropdown asset={asset} className="py-1 px-0.5 pt-1.5" />}
            {isRemoveAvailable && <RemoveAssetButton asset={asset} className="py-1 px-0.5 pt-1.5" />}
          </div>
        </div>
        <div className="px-2 pb-2 flex space-x-2 font-normal text-slate-400 text-xs">
          <p>{creationTime}</p>
          <p>{assetTypeToString(asset.type as AssetType)}</p>
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
  let [referenceElement, setReferenceElement] = useState();
  let [popperElement, setPopperElement] = useState();
  let { styles, attributes } = usePopper(referenceElement, popperElement, { placement: "auto-start" });

  return (
    <div className={`static ${rest.className ? rest.className : ""}`} onClick={(e) => e.stopPropagation()}>
      <Popover>
        <Popover.Button
          ref={setReferenceElement}
          className={
            "z-0 p-0 m-0 w-6 h-6 flex items-center place-content-center rounded-full text-slate-400 hover:text-slate-500 border-2 border-slate-200 bg-white hover:bg-slate-100"
          }
        >
          <BarsArrowDownIcon className="w-4 " />
        </Popover.Button>
        <Popover.Panel
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="mt-1 shadow-xl z-10 bg-white border-2 border-slate-200 rounded-lg absolute flex flex-col"
        >
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
              <span className="text-xs text-slate-400 tracking-wide">{fileTypeToString(file.type as FileType)}</span>
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
