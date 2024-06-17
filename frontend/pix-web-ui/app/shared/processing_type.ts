import { AssetType } from "~/services/assets";

export enum ProcessingType {
  Discovery = "discovery",
  Simulation = "simulation",
  WaitingTime = "waiting-time",
  Optimization = "optimization",
}

export const EnabledProcessingTypes = [ProcessingType.Optimization];

export const ProcessingTypes = Object.values(ProcessingType);

export function processingTypeToAssetType(type: ProcessingType | undefined | null): AssetType {
  if (!type) {
    return AssetType.EVENT_LOG;
  }

  switch (type) {
    case ProcessingType.Discovery:
      return AssetType.EVENT_LOG;
    case ProcessingType.Simulation:
      return AssetType.SIMULATION_MODEL;
    case ProcessingType.WaitingTime:
      return AssetType.EVENT_LOG;
    case ProcessingType.Optimization:
      return AssetType.OPTIMOS_CONFIGURATION;
    default:
      throw new Error("Invalid processing type");
  }
}

export function processingTypeToLabel(type: ProcessingType | undefined | null): string {
  if (!type) {
    return "Unknown";
  }

  switch (type) {
    case ProcessingType.Discovery:
      return "Discovery";
    case ProcessingType.Simulation:
      return "Simulation";
    case ProcessingType.WaitingTime:
      return "Waiting Time Analysis";
    case ProcessingType.Optimization:
      return "Optimization";
    default:
      throw new Error("Invalid processing type");
  }
}

export function processingTypeDescription(type: ProcessingType | undefined | null): string {
  if (!type) {
    return "Unknown";
  }

  switch (type) {
    case ProcessingType.Discovery:
      return "Discovery of a business process simulation model from an event log.";
    case ProcessingType.Simulation:
      return "Simulation of a business process model given the simulation model to generate a new synthetic event log.";
    case ProcessingType.WaitingTime:
      return "Analysis of the waiting time in a business process model given an event log.";
    case ProcessingType.Optimization:
      // TODO: Improve description
      return "Optimization of a business process model";
    default:
      throw new Error("Invalid processing type");
  }
}
