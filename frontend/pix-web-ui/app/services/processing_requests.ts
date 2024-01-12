export type ProcessingRequest = {
  id: string;
  creation_time: string;
  start_time?: string;
  end_time?: string;
  type: ProcessingRequestType;
  status: ProcessingRequestStatus;
  message?: string;
  user_id: string;
  project_id: string;
  input_assets_ids: string[];
  output_assets_ids: string[];
};

export enum ProcessingRequestType {
  SIMULATION_PROSIMOS = "simulation_prosimos",
  SIMULATION_MODEL_OPTIMIZATION_SIMOD = "process_model_optimization_simod",
  SIMULATION_MODEL_OPTIMIZATION_OPTIMOS = "process_model_optimization_optimos",
  WAITING_TIME_ANALYSIS_KRONOS = "waiting_time_analysis_kronos",
}

export enum ProcessingRequestStatus {
  CREATED = "created",
  RUNNING = "running",
  FINISHED = "finished",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export async function getProcessingRequest(id: string, token: string) {
  const url = `processing-requests/${id}`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  if (!response.ok) throw new Error(response.statusText);
  try {
    const data = await response.json();
    if (!data) throw new Error("No data");
    if ("message" in data && data.message) throw new Error(data.message);
    return data as ProcessingRequest;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
