import { useEffect, useMemo, useState } from "react";
import type { User } from "~/services/auth";
import { getFile, getFileLocation, type File as File_ } from "~/services/files";

export function useAssetFile(assetId: string, fileId: string, user: User) {
  const [file, setFile] = useState<File_ | null>(null);
  const [fileLocation, setFileLocation] = useState<string | null>(null);

  const fetchFile = useMemo(() => () => getFile(fileId, user.token!), [fileId, user.token]);
  const fetchFileLocation = useMemo(() => () => getFileLocation(fileId, user.token!), [fileId, user.token]);

  useEffect(() => {
    fetchFile().then(setFile);
    fetchFileLocation().then((fileLocation) => setFileLocation(fileLocation.location));
  }, [fetchFile, fetchFileLocation]);

  return { file, fileLocation };
}
