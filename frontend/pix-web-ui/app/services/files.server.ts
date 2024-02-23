import { filesURL, http } from "~/services/shared.server";
import type { File } from "./files";

export enum FileType {
  EVENT_LOG_CSV = "event_log_csv",
  EVENT_LOG_CSV_GZ = "event_log_csv_gz",
  EVENT_LOG_COLUMN_MAPPING_JSON = "event_log_column_mapping_json",
  PROCESS_MODEL_BPMN = "process_model_bpmn",
  CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml",
  SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json",
  CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json",
  CONFIGURATION_OPTIMOS_YAML = "configuration_optimos_yaml",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv",
  OPTIMIZATION_REPORT_OPTIMOS_JSON = "optimization_report_optimos_json",
}

export async function uploadFile(file: Blob, file_name: string, file_type: FileType, token: string) {
  const url = `${filesURL}/`;
  const bytes = await file.arrayBuffer();
  const response = await http.post(url, bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${token}`,
    },
    params: {
      name: file_name,
      type: file_type,
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

export async function getFileContent(fileId: string, token: string) {
  const url = `${filesURL}/${fileId}/content`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });
  return response.data;
}
