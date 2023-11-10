import axios from "axios";
import { Asset } from "./assets.server";

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
