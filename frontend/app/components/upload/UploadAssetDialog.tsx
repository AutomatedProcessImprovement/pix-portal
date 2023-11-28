import { Dialog } from "@headlessui/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { DragAndDropForm } from "~/components/upload/DragAndDropForm";
import UploadAssetSelect from "~/components/upload/UploadAssetSelect";
import { ProcessingType } from "~/routes/projects.$projectId.$processingType";
import { AssetType } from "~/services/assets";
import { useDialog } from "./useDialog";

const assetTypesForSelectMenu: AssetType[] = [AssetType.EVENT_LOG, AssetType.PROCESS_MODEL, AssetType.SIMULATION_MODEL];

export default function UploadAssetDialog({
  trigger,
  processingType,
}: {
  trigger: ReactNode;
  processingType?: ProcessingType;
}) {
  const initialAssetType = processingTypeToAssetType(processingType);
  let [assetType, setAssetType] = useState(initialAssetType);

  useEffect(() => {
    setAssetType(initialAssetType);
  }, [initialAssetType]);

  const { isOpen, open, close } = useDialog();

  return (
    <>
      <span onClick={() => open()} className="w-fit">
        {trigger}
      </span>
      <Dialog open={isOpen} onClose={() => close()} className="relative z-50">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-screen-xl rounded-2xl bg-white p-6 shadow-2xl ">
            <div className="flex flex-col space-y-4 items-center">
              <div className="flex items-baseline text-xl font-semibold">
                <span className="mr-2">Upload</span>
                <UploadAssetSelect assetTypes={assetTypesForSelectMenu} selected={assetType} onChange={setAssetType} />
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
    case AssetType.EVENT_LOG:
      return (
        <UploadAssetDetailsForAssetType
          assetType={assetType}
          children={
            <>
              An event log is a CSV file containing a list of events, one per line. Each line must contain at least the
              following columns, separated by commas: <code>case ID</code>, <code>activity</code>, <code>resource</code>
              , <code>start timestamp</code>, <code>end timestamp</code>.
            </>
          }
        />
      );
    case AssetType.PROCESS_MODEL:
      return (
        <UploadAssetDetailsForAssetType
          assetType={assetType}
          children={
            <>
              BPMN file is an XML file containing a BPMN model according to the{" "}
              <a href="https://www.omg.org/spec/BPMN/2.0/" target="_blank" rel="noreferrer">
                BPMN v2.0 standard
              </a>
              .
            </>
          }
        />
      );

    case AssetType.SIMULATION_MODEL:
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
      <DragAndDropForm assetType={assetType} />
    </div>
  );
}

function processingTypeToAssetType(type: ProcessingType | undefined | null): AssetType {
  if (!type) {
    return AssetType.EVENT_LOG;
  }

  switch (type) {
    case ProcessingType.Discovery:
      return AssetType.EVENT_LOG;
    case ProcessingType.Simulation:
      return AssetType.SIMULATION_MODEL;
    case ProcessingType.WaitingTime:
      return AssetType.EVENT_LOG;
    default:
      throw new Error("Invalid processing type");
  }
}
