import axios from "axios";
import { File } from "./files";

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
  files?: File[];
};

export const clientSideHttp = axios.create({
  baseURL: "http://localhost:9999/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAsset(assetId: string, token: string, lazy: boolean = true) {
  const url = `/assets/${assetId}`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      lazy: lazy, // NOTE: if false, the call returns the asset with its files as objects, not just ids
    },
  });
  return response.data as Asset;
}
