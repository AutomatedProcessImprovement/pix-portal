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
