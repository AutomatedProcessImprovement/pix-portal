import { ReactNode, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ActionFunctionArgs } from "@remix-run/node";

export default function UploadAssetDialog({ trigger }: { trigger: ReactNode }) {
  let [isOpen, setIsOpen] = useState(false);
  let [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

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
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-2xl ">
            <Dialog.Title>
              <span className="text-xl font-bold">Upload an asset</span>
            </Dialog.Title>
            <Dialog.Description>
              <p className="">Upload an asset to your project.</p>
            </Dialog.Description>

            <div className="my-10">
              <input
                type="file"
                onChange={(event) => {
                  setIsSubmitEnabled(!!event.target.files?.length);
                }}
              />
            </div>

            <nav className="flex items-center justify-start">
              <button onClick={() => setIsOpen(false)}>Close</button>
              <button
                className="ml-2"
                type="submit"
                disabled={!isSubmitEnabled}
              >
                Submit
              </button>
            </nav>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("Uploading asset...", request);
}
