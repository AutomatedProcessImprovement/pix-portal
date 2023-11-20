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

export enum FileType {
  EVENT_LOG_CSV = "event_log_csv",
  EVENT_LOG_CSV_GZ = "event_log_csv_gz",
  EVENT_LOG_COLUMN_MAPPING_JSON = "event_log_column_mapping_json",
  PROCESS_MODEL_BPMN = "process_model_bpmn",
  CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml",
  SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json",
  CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv",
}

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
