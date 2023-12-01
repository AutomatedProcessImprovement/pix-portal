import { Form, useNavigation } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
import { AssetCard } from "./AssetCard";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { SelectedAssetsContext } from "./contexts";

export default function SetupSimod() {
  // Simod requires one event log and, optionally, a process model

  const navigation = useNavigation();

  const [eventLog, setEventLog] = useState<Asset | null>(null);
  const [processModel, setProcessModel] = useState<Asset | null>(null);

  const [selectedInputAssetsIdsRef, setSelectedInputAssetsIdsRef] = useState<string[]>([]);

  const selectedAssets = useContext(SelectedAssetsContext);
  useEffect(() => {
    setEventLog(selectedAssets.find((asset) => asset.type === AssetType.EVENT_LOG) || null);
    setProcessModel(selectedAssets.find((asset) => asset.type === AssetType.PROCESS_MODEL) || null);
  }, [selectedAssets]);

  async function handleClick(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const assetsIds = selectedAssets.map((asset) => asset.id);
    setSelectedInputAssetsIdsRef(assetsIds);
  }

  return (
    <ProcessingAppSection heading="Discovery Configuration">
      {!eventLog && (
        <p className="py-2 prose prose-md prose-slate max-w-lg">
          Select a event log and, optionally, a process model from the input assets on the left.
        </p>
      )}
      {eventLog && (
        <Form method="post" className="flex flex-col items-center w-full my-4">
          <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIdsRef.join(",")} />
          <SimodConfiguration eventLog={eventLog} processModel={processModel} />
          <button
            className="mt-8 mb-6 w-2/3 xl:w-1/3 text-lg"
            type="submit"
            disabled={eventLog === null || navigation.state === "submitting"}
            onClick={handleClick}
          >
            Start discovery
          </button>
        </Form>
      )}
    </ProcessingAppSection>
  );
}

function SimodConfiguration({ eventLog, processModel }: { eventLog: Asset; processModel: Asset | null }) {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-4 border-slate-200 bg-slate-50 rounded-xl">
      <AssetCard asset={eventLog} isActive={false} isInteractive={false} />
      {processModel && <AssetCard asset={processModel} isActive={false} isInteractive={false} />}
    </div>
  );
}
