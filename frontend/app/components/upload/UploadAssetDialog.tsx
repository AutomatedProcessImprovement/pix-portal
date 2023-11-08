import { Dialog } from "@headlessui/react";
import { useNavigation } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { DragAndDropForm } from "~/components/upload/DragAndDropForm";
import UploadAssetSelect from "~/components/upload/UploadAssetSelect";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";

const assetTypesForSelectMenu: AssetTypeBackend[] = [
  AssetTypeBackend.EVENT_LOG,
  AssetTypeBackend.PROCESS_MODEL,
  AssetTypeBackend.SIMULATION_MODEL,
];

export default function UploadAssetDialog({ trigger }: { trigger: ReactNode }) {
  let [isOpen, setIsOpen] = useState(false);
  let [assetType, setAssetType] = useState(assetTypesForSelectMenu[0]);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === "loading") {
      setIsOpen(false);
    }
  }, [navigation.state]);

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
      <span onClick={() => setIsOpen(true)} className="w-fit">
        {trigger}
      </span>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
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

function UploadAssetDetails({ assetType }: { assetType: AssetTypeBackend }) {
  switch (assetType) {
    case AssetTypeBackend.EVENT_LOG:
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
    case AssetTypeBackend.PROCESS_MODEL:
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

    case AssetTypeBackend.SIMULATION_MODEL:
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

function UploadAssetDetailsForAssetType({ assetType, children }: { assetType: AssetTypeBackend; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <p className="max-w-prose">{children}</p>
      <DragAndDropForm assetType={assetType} />
    </div>
  );
}
