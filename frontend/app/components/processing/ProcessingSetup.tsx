import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets.server";
import DiscoverySetup from "./DiscoverySetup";
import SimulationSetup from "./SimulationSetup";
import WaitingTimeSetup from "./WaitingTimeSetup";

export default function ProcessingSetup({
  assets,
  processingType,
  selectedAssets,
}: {
  assets: Asset[];
  processingType: ProcessingType;
  selectedAssets: Asset[];
}) {
  function chooseProcessingSetup() {
    switch (processingType) {
      case ProcessingType.Discovery:
        return <DiscoverySetup selectedAssets={selectedAssets} />;
      case ProcessingType.Simulation:
        return <SimulationSetup />;
      case ProcessingType.WaitingTime:
        return <WaitingTimeSetup />;
      default:
        throw new Error("Invalid processing type");
    }
  }

  return <>{chooseProcessingSetup()}</>;
}
