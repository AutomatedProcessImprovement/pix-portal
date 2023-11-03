import { filesURL, http } from "~/services/shared";

export type File = {
  id: string;
  url: string;
  content_hash: string;
  creation_time: string;
  deletion_time?: string;
};

export async function uploadFile(file: Blob, token: string) {
  const url = `${filesURL}/`;
  const bytes = await file.arrayBuffer();
  const response = await http.post(url, bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as File;
}

export async function deleteFile(fileId: string, token: string) {
  const url = `${filesURL}/${fileId}`;
  await http.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
