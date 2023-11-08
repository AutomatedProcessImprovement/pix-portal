export enum AssetTypeBackend {
  EVENT_LOG = "event_log",
  PROCESS_MODEL = "process_model",
  SIMULATION_MODEL = "simulation_model",
  SIMOD_CONFIGURATION = "simod_configuration",
  OPTIMOS_CONFIGURATION = "optimos_configuration",
}

export function assetTypeToString(type: AssetTypeBackend): string {
  switch (type) {
    case AssetTypeBackend.EVENT_LOG:
      return "Event Log";
    case AssetTypeBackend.PROCESS_MODEL:
      return "Process Model";
    case AssetTypeBackend.SIMULATION_MODEL:
      return "Simulation Model";
    case AssetTypeBackend.SIMOD_CONFIGURATION:
      return "SIMOD Configuration";
    case AssetTypeBackend.OPTIMOS_CONFIGURATION:
      return "OPTIMOS Configuration";
    default:
      throw new Error(`Unknown asset type ${type}`);
  }
}
