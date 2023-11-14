import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

export default function SetupProsimos({ selectedAssets }: { selectedAssets: Asset[] }) {
  const navigation = useNavigation();
  const selectedAssetsIdsRef = useRef<HTMLInputElement>(null);
  const [simulationModel, setSimulationModel] = useState<Asset | null>(null);

  useEffect(() => {
    setSimulationModel(selectedAssets.find((asset) => asset.type === AssetTypeBackend.SIMULATION_MODEL) || null);
  }, [selectedAssets]);

  return (
    <section className="p-2 space-y-2">
      <h2 className="text-xl font-semibold">Discovery Setup</h2>
      <Form method="post" className="flex flex-col space-y-2">
        <input type="hidden" name="selectedInputAssetsIds" ref={selectedAssetsIdsRef} />
        <SimulationModelArea asset={simulationModel} />
        <button
          type="submit"
          disabled={simulationModel === null || navigation.state === "submitting"}
          onClick={(e) => e.preventDefault()}
        >
          Start simulation
        </button>
      </Form>
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
