import axios from "axios";

export type Asset = {
  id: string;
  creation_time: string;
  modification_time?: string;
  deletion_time?: string;
  name: string;
  description?: string;
  type: string;
  project_id: string;
  files_ids: string[];
  users_ids: string[];
  processing_requests_ids?: string[];
};

export const clientSideHttp = axios.create({
  baseURL: "http://localhost:9999/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAsset(assetId: string, token: string) {
  const url = `/assets/${assetId}`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Asset;
}
