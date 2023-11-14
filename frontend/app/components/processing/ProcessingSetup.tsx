import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { Asset } from "~/services/assets.server";
import SetupKronos from "./SetupKronos";
import SetupProsimos from "./SetupProsimos";
import SetupSimod from "./SetupSimod";

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
        return <SetupSimod selectedAssets={selectedAssets} />;
      case ProcessingType.Simulation:
        return <SetupProsimos />;
      case ProcessingType.WaitingTime:
        return <SetupKronos />;
      default:
        throw new Error("Invalid processing type");
    }
  }

  return <>{chooseProcessingSetup()}</>;
}
