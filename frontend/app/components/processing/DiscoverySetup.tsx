import { useEffect, useState } from "react";
import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

export default function DiscoverySetup({ selectedAssets }: { selectedAssets: Asset[] }) {
  // Simod requires one event log and, optionally, a process model

  const [eventLog, setEventLog] = useState<Asset | null>(null);
  const [processModel, setProcessModel] = useState<Asset | null>(null);

  useEffect(() => {
    setEventLog(selectedAssets.find((asset) => asset.type === AssetTypeBackend.EVENT_LOG) || null);
    setProcessModel(selectedAssets.find((asset) => asset.type === AssetTypeBackend.PROCESS_MODEL) || null);
  }, [selectedAssets, eventLog, processModel]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Discovery Setup</h2>
      <EventLogArea eventLog={eventLog} />
      <ProcessModelArea processModel={processModel} />
      <button type="button" disabled={eventLog === null} onClick={handleClick}>
        Start discovery
      </button>
    </section>
  );
}

function EventLogArea({ eventLog }: { eventLog: Asset | null }) {
  return (
    <div className="border-4 border-blue-100">
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
    <div className="border-4 border-blue-100">
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
