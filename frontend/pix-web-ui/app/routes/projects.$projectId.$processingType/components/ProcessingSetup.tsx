import { useCallback } from "react";
import { ProcessingType } from "~/shared/processing_type";
import SetupKronos from "./SetupKronos";
import SetupProsimos from "./SetupProsimos";
import SetupSimod from "./SetupSimod";

export default function ProcessingSetup({ processingType }: { processingType: ProcessingType }) {
  const getProcessingSetup = useCallback(() => {
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
  }, [processingType]);

  const processingSetup = getProcessingSetup();

  return <>{processingSetup}</>;
}
