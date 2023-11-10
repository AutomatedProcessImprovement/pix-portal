import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

export default function DiscoverySetup({ selectedAssets }: { selectedAssets: Asset[] }) {
  // Simod requires one event log and, optionally, a process model

  const [eventLog, setEventLog] = useState<Asset | null>(null);
  const [processModel, setProcessModel] = useState<Asset | null>(null);

  const [selectedInputAssetsIdsRef, setSelectedInputAssetsIdsRef] = useState<string[]>([]);

  useEffect(() => {
    setEventLog(selectedAssets.find((asset) => asset.type === AssetTypeBackend.EVENT_LOG) || null);
    setProcessModel(selectedAssets.find((asset) => asset.type === AssetTypeBackend.PROCESS_MODEL) || null);
  }, [selectedAssets]);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const assetsIds = selectedAssets.map((asset) => asset.id);
    setSelectedInputAssetsIdsRef(assetsIds);
  }

  return (
    <section className="p-2 space-y-2">
      <h2 className="text-xl font-semibold">Discovery Setup</h2>
      <Form method="post" className="flex flex-col space-y-2">
        <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIdsRef.join(",")} />
        <EventLogArea eventLog={eventLog} />
        <ProcessModelArea processModel={processModel} />
        <button type="submit" disabled={eventLog === null} onClick={handleClick}>
          Start discovery
        </button>
      </Form>
    </section>
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
