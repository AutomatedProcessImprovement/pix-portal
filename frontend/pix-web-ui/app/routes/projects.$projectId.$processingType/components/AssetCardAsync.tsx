import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { Asset } from "~/services/assets";
import { getAsset } from "~/services/assets";
import type { User } from "~/services/auth";
import type { File } from "~/services/files";
import { getFile, getFileLocation } from "~/services/files";
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

export function FileCardAsync({ assetId, fileId, user }: { assetId: string; fileId: string; user: User | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileLocation, setFileLocation] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!user) return;
    getFile(fileId, user.token!).then((file) => setFile(file));
    getFileLocation(fileId, user.token!).then((fileLocation) => setFileLocation(fileLocation.location));
  }, [assetId, fileId, user]);

  useEffect(() => {
    // programmatically click the hidden link to trigger download
    hiddenAnchorRef.current?.click();
    // revoke the object URL to remove the reference to the file and avoid memory leaks
    window.URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
  }, [downloadUrl]);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    if (!fileLocation) return;

    // download the file from the backend using the user's token
    const response = await axios.get(fileLocation, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    // create an in-memory file and a link to it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    setDownloadUrl(url);
  }

  if (file && fileLocation) {
    return (
      <div className="px-2 bg-indigo-100 flex flex-wrap" data-fileid={file.id}>
        <span onClick={handleClick} className="text-blue-600 hover:text-blue-800 cursor-pointer space-x-1">
          <ArrowDownTrayIcon className="inline-block w-5 h-5" />
          <span className="underline">{file.name}</span>
        </span>
        ({file.type})
        {downloadUrl && (
          <a href={downloadUrl} ref={hiddenAnchorRef} download={file.name} className="hidden">
            Download
          </a>
        )}
      </div>
    );
  }

  return null;
}
