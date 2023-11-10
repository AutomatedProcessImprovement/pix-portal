import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { getAsset } from "~/services/assets";
import { Asset } from "~/services/assets.server";
import { User } from "~/services/auth.server";
import { File, getFile, getFileLocation } from "~/services/files";

export function AssetCardAsync({ assetId, user }: { assetId: string; user: User }) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    getAsset(assetId, user.token!).then((asset) => setAsset(asset));
  }, [assetId]);

  return (
    <div className="bg-teal-200 m-2 p-2">
      {asset && (
        <div className="flex flex-col">
          <div className="">
            Name: <span className="font-semibold">{asset.name}</span>
          </div>
          <div>
            Type: <span className="font-semibold">{asset.type}</span>
          </div>
          <div className="flex flex-col space-y-2">
            {asset.files_ids.length > 0 &&
              asset.files_ids.map((fileId) => (
                <FileCardAsync key={fileId} assetId={assetId} fileId={fileId} user={user} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileCardAsync({ assetId, fileId, user }: { assetId: string; fileId: string; user: User }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileLocation, setFileLocation] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    getFile(fileId, user.token!).then((file) => setFile(file));
    getFileLocation(fileId, user.token!).then((fileLocation) => setFileLocation(fileLocation.location));
  }, [assetId, fileId]);

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
        Authorization: `Bearer ${user.token}`,
      },
    });

    // create an in-memory file and a link to it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    setDownloadUrl(url);
  }

  if (file && fileLocation) {
    return (
      <div className="px-2 bg-indigo-100 flex flex-wrap">
        <span onClick={handleClick} className="text-blue-600 hover:text-blue-800 cursor-pointer space-x-1">
          <ArrowDownTrayIcon className="inline-block w-5 h-5" />
          <span className="underline">{file.name}</span>
        </span>
        ({file.type})
        {downloadUrl && <a href={downloadUrl} ref={hiddenAnchorRef} download={file.name} className="hidden" />}
      </div>
    );
  }

  return null;
}
