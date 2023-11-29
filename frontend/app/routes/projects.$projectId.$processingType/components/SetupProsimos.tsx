import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Asset } from "~/services/assets";
import { AssetType, getAsset } from "~/services/assets";
import ProsimosConfiguration from "./ProsimosConfiguration";
import { SelectedAssetsContext, UserContext } from "./contexts";

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
    <section className="p-2 space-y-2">
      <h2 className="text-xl font-semibold">Simulation Setup</h2>
      <Form
        method="post"
        className="flex flex-col space-y-2"
        onChange={(e) => submitProsimosSimulation(e.currentTarget)}
      >
        <input type="hidden" name="selectedInputAssetsIds" ref={selectedAssetsIdsRef} />
        <SimulationModelArea asset={simulationModel} />
        <button type="submit" disabled={simulationModel === null || navigation.state === "submitting"}>
          Start simulation
        </button>
      </Form>
      <ProsimosConfiguration asset={simulationModel} />
    </section>
  );
}

function SimulationModelArea({ asset }: { asset: Asset | null }) {
  return (
    <div className="p-2 border-4 border-blue-100">
      {asset ? (
        <div>
          <div>Simulation model: {asset.name}</div>
        </div>
      ) : (
        <div>No simulation model selected</div>
      )}
    </div>
  );
}
