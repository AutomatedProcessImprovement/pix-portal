import { AssetType } from "~/services/assets";

export enum ProcessingType {
  Discovery = "discovery",
  Simulation = "simulation",
  WaitingTime = "waiting-time",
}

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
    default:
      throw new Error("Invalid processing type");
  }
}
