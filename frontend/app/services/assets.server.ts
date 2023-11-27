import { assetsURL, http } from "~/services/shared.server";
import type { AssetTypeBackend } from "../shared/AssetTypeBackend";
import type { Asset } from "./assets";

export async function createAsset(
  filesIds: string[],
  name: string,
  type: AssetTypeBackend,
  projectId: string,
  token: string
) {
  const url = `${assetsURL}/`;
  const payload = {
    name: name,
    type: type,
    project_id: projectId,
    files_ids: filesIds,
  };
  const response = await http.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Asset;
}

export async function deleteAsset(assetId: string, token: string) {
  const url = `${assetsURL}/${assetId}`;
  await http.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAssetsForProject(projectId: string, token: string): Promise<Asset[]> {
  const url = `${assetsURL}/?project_id=${projectId}`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Asset[];
}
