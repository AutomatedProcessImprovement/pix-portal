import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useMatches } from "react-router";
import { Asset } from "~/services/assets.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

export default function DiscoverySetup({ selectedAssets }: { selectedAssets: Asset[] }) {
  // Simod requires one event log and, optionally, a process model

  // get data from the route component's URL
  const matches = useMatches();
  console.log;
  let parentParams, parentData;
  matches.forEach((m) => {
    if (m.id === "routes/projects.$projectId.$processingType") {
      parentParams = m.params;
    }
    if (m.id === "root") {
      parentData = m.data;
    }
  });
  const { projectId, processingType } = parentParams as any;
  const { user } = parentData as any;

  const [eventLog, setEventLog] = useState<Asset | null>(null);
  const [processModel, setProcessModel] = useState<Asset | null>(null);

  const [selectedInputAssetsIdsRef, setSelectedInputAssetsIdsRef] = useState<string[]>([]);

  useEffect(() => {
    setEventLog(selectedAssets.find((asset) => asset.type === AssetTypeBackend.EVENT_LOG) || null);
    setProcessModel(selectedAssets.find((asset) => asset.type === AssetTypeBackend.PROCESS_MODEL) || null);
  }, [selectedAssets, eventLog, processModel]);

  useEffect(() => {});

  async function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const assetsIds = selectedAssets.map((asset) => asset.id);
    setSelectedInputAssetsIdsRef(assetsIds);
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Discovery Setup</h2>
      <Form method="post">
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
