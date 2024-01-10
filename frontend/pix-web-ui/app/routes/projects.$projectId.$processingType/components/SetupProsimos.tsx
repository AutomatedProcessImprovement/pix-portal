import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "~/routes/contexts";
import type { Asset } from "~/services/assets";
import { AssetType, getAsset } from "~/services/assets";
import { ProcessingAppSection } from "./ProcessingAppSection";
import ProsimosConfiguration from "./ProsimosConfiguration";
import { SelectedAssetsContext } from "./contexts";

export default function SetupProsimos() {
  const navigation = useNavigation();
  const selectedAssetsIdsRef = useRef<HTMLInputElement>(null);
  const [simulationModel, setSimulationModel] = useState<Asset | null>(null);

  const user = useContext(UserContext);
  const selectedAssets = useContext(SelectedAssetsContext);

  const fetchSimulationModel = useCallback(async () => {
    const simulationModel = selectedAssets.find((asset) => asset.type === AssetType.SIMULATION_MODEL);
    if (simulationModel && user?.token) {
      // this call populates the files field with the file objects, so we can find a BPMN model file and fetch its content
      const asset = await getAsset(simulationModel.id, user?.token, false);
      setSimulationModel(asset);
    } else {
      setSimulationModel(null);
    }
  }, [selectedAssets, user?.token]);

  useEffect(() => {
    selectedAssetsIdsRef.current!.value = selectedAssets.map((asset) => asset.id).join(",");
    fetchSimulationModel();
  }, [selectedAssets, fetchSimulationModel]);

  const submitProsimosSimulation = useSubmit();

  return (
    <ProcessingAppSection heading="Simulation Configuration">
      <ProsimosConfiguration asset={simulationModel} />
      <Form
        method="post"
        className="flex flex-col items-center w-full my-4"
        onChange={(e) => submitProsimosSimulation(e.currentTarget)}
      >
        <input type="hidden" name="selectedInputAssetsIds" ref={selectedAssetsIdsRef} />
        {!simulationModel && (
          <p className="py-2 prose prose-md prose-slate max-w-lg">
            Select a simulation model from the input assets on the left.
          </p>
        )}
        {simulationModel && (
          <button
            className="mt-8 mb-6 w-2/3 xl:w-1/3 text-lg"
            type="submit"
            disabled={simulationModel === null || navigation.state === "submitting"}
          >
            Start simulation
          </button>
        )}
      </Form>
    </ProcessingAppSection>
  );
}
