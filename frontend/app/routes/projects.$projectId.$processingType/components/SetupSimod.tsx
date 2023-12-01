import { Form, useNavigation } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
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
        <Form method="post" className="flex flex-col space-y-2">
          <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIdsRef.join(",")} />
          <EventLogArea eventLog={eventLog} />
          <ProcessModelArea processModel={processModel} />
          <button type="submit" disabled={eventLog === null || navigation.state === "submitting"} onClick={handleClick}>
            Start discovery
          </button>
        </Form>
      )}
    </ProcessingAppSection>
  );
}

function EventLogArea({ eventLog }: { eventLog: Asset | null }) {
  return (
    <div className="p-2 border-4 border-blue-100">
      {eventLog ? (
        <div>
          <div>Event log: {eventLog.name}</div>
        </div>
      ) : (
        <div>No event log selected</div>
      )}
    </div>
  );
}

function ProcessModelArea({ processModel }: { processModel: Asset | null }) {
  return (
    <div className="p-2 border-4 border-blue-100">
      {processModel ? (
        <div>
          <div>Process model: {processModel.name}</div>
        </div>
      ) : (
        <div>No process model selected</div>
      )}
    </div>
  );
}
