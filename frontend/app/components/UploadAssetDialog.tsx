import { ReactNode, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ActionFunctionArgs } from "@remix-run/node";
import UploadAssetSelect from "~/components/UploadAssetSelect";
import { Form } from "@remix-run/react";

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
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 w-96 h-96">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-2xl ">
            <Dialog.Title>
              <span className="text-xl font-bold">Upload an asset</span>
            </Dialog.Title>
            <Dialog.Description>Upload an asset to your project.</Dialog.Description>

            <div className="my-10">
              <div className="flex items-baseline text-xl font-semibold my-4">
                <span className="mr-2">Upload</span>
                <UploadAssetSelect assetTypes={assetTypes} selected={assetType} onChange={setAssetType} />
              </div>

              <AssetTypeUploadDetails assetType={assetType} />
            </div>

            <nav className="flex items-center justify-start">
              <button onClick={() => setIsOpen(false)}>Close</button>
              <button form="new-asset-form" className="ml-2" type="submit">
                Submit
              </button>
            </nav>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

function AssetTypeUploadDetails({ assetType }: { assetType: AssetType }) {
  switch (assetType) {
    case AssetType.EventLog:
      return (
        <div>
          <div id="description">
            <p>An event log is a CSV file containing a list of events, one per line.</p>
            <p>Each line should contain the following columns, separated by commas:</p>
            <ol>
              <li>Case ID</li>
              <li>Activity</li>
              <li>Timestamp</li>
            </ol>
          </div>
          <Form id="new-asset-form" className="my-4" method="post" encType="multipart/form-data">
            <div>drag'n'drop field 1</div>
            <input type="hidden" name="assetType" value={assetType} />
          </Form>
        </div>
      );
    case AssetType.ProcessModel:
      return (
        <div>
          <div id="description">
            <p>BPMN files are XML files containing a BPMN model.</p>
          </div>
          <Form id="new-asset-form" className="my-4" method="post" encType="multipart/form-data">
            <div>drag'n'drop field 1</div>
            <input type="hidden" name="assetType" value={assetType} />
          </Form>
        </div>
      );
    case AssetType.SimulationModel:
      return (
        <div>
          <div id="description">
            <p>BPS model consists of two files: a BPMN model and simulation parameters in JSON format.</p>
          </div>
          <Form id="new-asset-form" className="my-4" method="post" encType="multipart/form-data">
            <div>drag'n'drop field 1</div>
            <div>drag'n'drop field 2</div>
            <input type="hidden" name="assetType" value={assetType} />
          </Form>
        </div>
      );
    default:
      return <div>Unknown asset type</div>;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("Uploading asset...", request);
}
