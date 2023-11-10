import { clientSideHttp } from "./assets";

export type File = {
  id: string;
  name: string;
  type: string;
  url: string;
  users_ids: string[];
  content_hash: string;
  creation_time: string;
  deletion_time?: string;
};

export async function getFile(fileId: string, token: string) {
  const url = `/files/${fileId}`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as File;
}

export type FileLocation = {
  location: string; // URL to file
};

export async function getFileLocation(fileId: string, token: string) {
  const url = `/files/${fileId}/location`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as FileLocation;
}

export async function getFileContent(fileId: string, token: string) {
  const url = `/files/${fileId}/content`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Blob;
}
