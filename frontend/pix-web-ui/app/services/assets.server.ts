import { assetsURL } from "~/services/shared.server";
import type { Asset, AssetType } from "./assets";

export async function createAsset(filesIds: string[], name: string, type: AssetType, projectId: string, token: string) {
  const url = `${assetsURL}/`;
  const payload = {
    name: name,
    type: type,
    project_id: projectId,
    files_ids: filesIds,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if ("message" in data) throw new Error(data.message);
  return data as Asset;
}

export async function deleteAsset(assetId: string, token: string) {
  const url = `${assetsURL}/${assetId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "DELETE",
  });
  try {
    const data = await response.json();
    if ("message" in data) throw new Error(data.message);
  } catch (e) {
    console.error(e);
  }
}

export async function getAssetsForProject(projectId: string, token: string): Promise<Asset[]> {
  const url = `${assetsURL}/?project_id=${projectId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if ("message" in data) throw new Error(data.message);
  return data as Asset[];
}
