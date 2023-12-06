import type { File } from "./files";
import { clientSideHttp } from "./shared.client";

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

export enum AssetType {
  EVENT_LOG = "event_log",
  PROCESS_MODEL = "process_model",
  SIMULATION_MODEL = "simulation_model",
  SIMOD_CONFIGURATION = "simod_configuration",
  OPTIMOS_CONFIGURATION = "optimos_configuration",
}

export function assetTypeToString(type: AssetType): string {
  switch (type) {
    case AssetType.EVENT_LOG:
      return "Event Log";
    case AssetType.PROCESS_MODEL:
      return "Process Model";
    case AssetType.SIMULATION_MODEL:
      return "Simulation Model";
    case AssetType.SIMOD_CONFIGURATION:
      return "SIMOD Configuration";
    case AssetType.OPTIMOS_CONFIGURATION:
      return "OPTIMOS Configuration";
    default:
      throw new Error(`Unknown asset type ${type}`);
  }
}

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

export type AssetPatchIn = {
  name?: string;
  description?: string;
  type?: string;
  project_id?: string;
  files_ids?: string[];
  users_ids?: string[];
  processing_requests_ids?: string[];
};

export async function patchAsset(assetUpdate: AssetPatchIn, assetId: string, token: string) {
  const url = `/assets/${assetId}`;
  const response = await clientSideHttp.patch(url, assetUpdate, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Asset;
}
