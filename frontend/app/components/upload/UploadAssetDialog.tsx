import { ReactNode, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import UploadAssetSelect from "~/components/upload/UploadAssetSelect";
import { DragAndDrop } from "~/components/upload/DragAndDrop";

export enum AssetType {
  EventLog = "Event Log",
  ProcessModel = "Process Model",
  SimulationModel = "Simulation Model",
}

const assetTypes: AssetType[] = [AssetType.EventLog, AssetType.ProcessModel, AssetType.SimulationModel];

export default function UploadAssetDialog({ trigger }: { trigger: ReactNode }) {
  let [isOpen, setIsOpen] = useState(false);
  let [assetType, setAssetType] = useState(assetTypes[0]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="w-fit">
        {trigger}
      </div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-screen-xl rounded-2xl bg-white p-6 shadow-2xl ">
            <div className="flex flex-col space-y-4 items-center">
              <div className="flex items-baseline text-xl font-semibold">
                <span className="mr-2">Upload</span>
                <UploadAssetSelect assetTypes={assetTypes} selected={assetType} onChange={setAssetType} />
              </div>

              <UploadAssetDetails assetType={assetType} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

function UploadAssetDetails({ assetType }: { assetType: AssetType }) {
  switch (assetType) {
    case AssetType.EventLog:
      return (
        <UploadAssetDetailsForAssetType
          assetType={assetType}
          children={
            <>
              An event log is a CSV file containing a list of events, one per line. Each line must contain at least the
              following columns, separated by commas: <code>caseId</code>, <code>activity</code>,{" "}
              <code>start timestamp</code>, <code>end timestamp</code>.
            </>
          }
        />
      );
    case AssetType.ProcessModel:
      return (
        <UploadAssetDetailsForAssetType
          assetType={assetType}
          children={
            <>
              BPMN file is an XML file containing a BPMN model according to the{" "}
              <a href="https://www.omg.org/spec/BPMN/2.0/" target="_blank">
                BPMN v2.0 standard
              </a>
              .
            </>
          }
        />
      );

    case AssetType.SimulationModel:
      return (
        <UploadAssetDetailsForAssetType
          assetType={assetType}
          children={
            <>
              Simulation model consists of two files: a process model in BPMN and simulation parameters in JSON format.
            </>
          }
        />
      );
    default:
      return <div>Unknown asset type</div>;
  }
}

function UploadAssetDetailsForAssetType({ assetType, children }: { assetType: AssetType; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <p className="max-w-prose">{children}</p>
      <DragAndDrop assetType={assetType} />
    </div>
  );
}
