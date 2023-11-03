import { assetsURL, http } from "~/services/shared";

export type Asset = {
  id: string;
  creation_time: string;
  modification_time?: string;
  deletion_time?: string;
  name: string;
  description?: string;
  type: string;
  file_id: string;
  project_id: string;
  processing_requests_ids?: string[];
};

export enum AssetTypeBackend {
  EVENT_LOG_CSV = "event_log_csv",
  EVENT_LOG_CSV_GZ = "event_log_csv_gz",
  EVENT_LOG_COLUMN_MAPPING_JSON = "event_log_column_mapping_json",
  PROCESS_MODEL_BPMN = "process_model_bpmn",
  CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml",
  SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json",
  CONFIGURATION_PROSIMOS_YAML = "configuration_prosimos_yaml",
  CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv",
}

export async function createAsset(
  fileId: string,
  name: string,
  type: AssetTypeBackend,
  projectId: string,
  token: string
) {
  const url = `${assetsURL}/`;
  const payload = {
    name: name,
    type: type,
    file_id: fileId,
    project_id: projectId,
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
