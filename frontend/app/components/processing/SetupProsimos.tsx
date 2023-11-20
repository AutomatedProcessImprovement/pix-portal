import { Form, useNavigation } from "@remix-run/react";
import { useContext, useEffect, useRef, useState } from "react";
import { Asset } from "~/services/assets";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";
import ProsimosConfiguration from "./ProsimosConfiguration";
import { SelectedAssetsContext } from "./contexts";

export default function SetupProsimos() {
  const navigation = useNavigation();
  const selectedAssetsIdsRef = useRef<HTMLInputElement>(null);
  const [simulationModel, setSimulationModel] = useState<Asset | null>(null);

  const selectedAssets = useContext(SelectedAssetsContext);
  useEffect(() => {
    setSimulationModel(selectedAssets.find((asset) => asset.type === AssetTypeBackend.SIMULATION_MODEL) || null);
    selectedAssetsIdsRef.current!.value = selectedAssets.map((asset) => asset.id).join(",");
  }, [selectedAssets]);

  return (
    <section className="p-2 space-y-2">
      <h2 className="text-xl font-semibold">Simulation Setup</h2>
      <Form method="post" className="flex flex-col space-y-2">
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
