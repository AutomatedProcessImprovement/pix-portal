import { Dialog } from "@headlessui/react";
import type { ReactNode } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { DragAndDropForm } from "~/components/asset-upload/DragAndDropForm";
import { AssetType, assetTypeToString } from "~/services/assets";
import SelectList from "../SelectList";
import type { ILabeledAny } from "../shared";
import { makeLabeledAny } from "../shared";
import { SelectedAssetTypeContext } from "./contexts";
import { useDialog } from "./useDialog";

export default function UploadAssetDialog({
  trigger,
  initialAssetType,
}: {
  trigger: ReactNode;
  initialAssetType?: AssetType;
}) {
  let [assetType, setAssetType] = useState<ILabeledAny | undefined>();

  const assetTypes = useMemo(() => {
    const options = [AssetType.EVENT_LOG, AssetType.PROCESS_MODEL, AssetType.SIMULATION_MODEL].map((assetType) => ({
      label: assetTypeToString(assetType),
      value: assetType,
    }));
    return options;
  }, []);

  useEffect(() => {
    setAssetType(
      makeLabeledAny(initialAssetType, assetTypeToString) || makeLabeledAny(AssetType.EVENT_LOG, assetTypeToString)
    );
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
              <SelectedAssetTypeContext.Provider value={{ assetType, assetTypes }}>
                <div className="flex items-baseline text-xl font-semibold">
                  <span className="mr-2">Upload</span>
                  <UploadAssetSelect assetType={assetType} onChange={setAssetType} />
                </div>
                <UploadAssetDetails />
              </SelectedAssetTypeContext.Provider>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

function UploadAssetSelect({
  assetType,
  onChange,
}: {
  assetType?: ILabeledAny;
  onChange: (value: ILabeledAny | undefined) => void;
}) {
  const context = useContext(SelectedAssetTypeContext);
  if (!context) return <></>;
  return <SelectList selected={assetType} onChange={onChange} options={context.assetTypes} className="w-64" />;
}

function UploadAssetDetails() {
  const context = useContext(SelectedAssetTypeContext);
  if (!context) return <></>;
  const assetType = context.assetType?.value;

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
