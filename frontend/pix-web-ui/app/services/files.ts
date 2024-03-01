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
  STATISTICS_PROSIMOS_CSV = "statistics_prosimos_csv",
  CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json",
  CONFIGURATION_OPTIMOS_YAML = "configuration_optimos_yaml",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json",
  WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv",
  OPTIMIZATION_REPORT_OPTIMOS_JSON = "optimization_report_optimos_json",
}

export function fileTypeToString(fileType: FileType) {
  switch (fileType) {
    case FileType.EVENT_LOG_CSV:
      return "Event Log";
    case FileType.EVENT_LOG_CSV_GZ:
      return "Event Log";
    case FileType.EVENT_LOG_COLUMN_MAPPING_JSON:
      return "Column Mapping";
    case FileType.PROCESS_MODEL_BPMN:
      return "Process Model";
    case FileType.CONFIGURATION_SIMOD_YAML:
      return "Discovery Configuration";
    case FileType.SIMULATION_MODEL_PROSIMOS_JSON:
      return "Simulation Model";
    case FileType.STATISTICS_PROSIMOS_CSV:
      return "Simulation Statistics";
    case FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON:
      return "Optimizer Model";
    case FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON:
      return "Waiting Time Report (JSON)";
    case FileType.CONFIGURATION_OPTIMOS_YAML:
      return "Optimizer Configuration (YAML)";
    case FileType.WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV:
      return "Waiting Time Report (CSV)";
    case FileType.OPTIMIZATION_REPORT_OPTIMOS_JSON:
      return "Optimizer Report (JSON)";
  }
}

export async function getFile(fileId: string, token: string) {
  const url = `files/${fileId}`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  const data = await response.json();
  return data as File;
}

export type FileLocation = {
  location: string; // URL to file
};

export async function getFileLocation(fileId: string, token: string) {
  const url = `files/${fileId}/location`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  const data = await response.json();
  return data as FileLocation;
}

export async function getFileContent(fileId: string, token: string) {
  const url = `files/${fileId}/content`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  const data = await response.blob();
  return data as Blob;
}

export async function uploadFile(file: Blob, file_name: string, file_type: FileType, token: string) {
  const bytes = await file.arrayBuffer();
  const params = new URLSearchParams({ name: file_name, type: file_type });
  const url = `files/?${params}`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
    body: bytes,
  });
  const data = await response.json();
  return data as File;
}

export async function deleteFile(fileId: string, token: string) {
  const url = `files/${fileId}`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  if (response.status !== 204) {
    throw new Error(`Error while deleting file ${fileId}`);
  }
}
