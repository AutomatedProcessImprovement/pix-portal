import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { User } from "~/services/auth";

export function useDownloadProps(fileLocation: string | null, user: User | undefined | null) {
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // programmatically click the hidden link to trigger download
    hiddenAnchorRef.current?.click();
    // revoke the object URL to remove the reference to the file and avoid memory leaks
    window.URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
  }, [downloadUrl]);

  async function handleClick(e: any) {
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

  return { downloadUrl, hiddenAnchorRef, handleClick };
}
