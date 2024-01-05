import { filesURL } from "~/services/shared.server";
import type { File } from "./files";

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

export async function uploadFile(file: Blob, file_name: string, file_type: FileType, token: string) {
  const url = `${filesURL}/`;
  const bytes = await file.arrayBuffer();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${token}`,
    },
    body: bytes,
  });
  const data = await response.json();
  if ("message" in data) throw new Error(data.message);
  return data as File;
}

export async function deleteFile(fileId: string, token: string) {
  const url = `${filesURL}/${fileId}`;
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
