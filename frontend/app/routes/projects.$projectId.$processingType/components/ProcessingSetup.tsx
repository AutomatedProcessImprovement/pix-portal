import { ProcessingType } from "~/shared/processing_type";
import SetupKronos from "./SetupKronos";
import SetupProsimos from "./SetupProsimos";
import SetupSimod from "./SetupSimod";

export default function ProcessingSetup({ processingType }: { processingType: ProcessingType }) {
  function chooseProcessingSetup() {
    switch (processingType) {
      case ProcessingType.Discovery:
        return <SetupSimod />;
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
