import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Form } from "@remix-run/react";
import { EventLogColumnMapping } from "~/components/upload/column_mapping";

export default function EventLogColumnMappingDialog({
  trigger,
  columnMapping,
  setColumnMapping,
  setColumnMappingFilledIn,
}: {
  trigger: ReactNode;
  columnMapping: EventLogColumnMapping;
  setColumnMapping: (arg: EventLogColumnMapping) => void;
  setColumnMappingFilledIn: (arg: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitEnabled, setSubmitEnabled] = useState(false);

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

  useEffect(() => {
    setSubmitEnabled(columnMapping.isValid());
  }, [
    columnMapping.caseId,
    columnMapping.activity,
    columnMapping.resource,
    columnMapping.startTimestamp,
    columnMapping.endTimestamp,
  ]);

  useEffect(() => {
    if (!isOpen && !columnMapping.isValid()) {
      setColumnMappingFilledIn(false);
    }
  }, [isOpen]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    const { name, value } = event.target;
    setColumnMapping(new EventLogColumnMapping({ ...columnMapping, [name]: value }));
  }

  function handleSave() {
    if (columnMapping.isValid()) {
      setColumnMappingFilledIn(true);
      setIsOpen(false);
    } else {
      setColumnMappingFilledIn(false);
      setErrorMessage("Please fill in all fields");
    }
  }

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
            <section className="flex flex-col space-y-4 items-center">
              <h2 className="text-xl font-semibold">Column mapping</h2>
              <Form className="p-4 flex flex-col space-y-8 items-center">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="caseId">Case ID column:</label>
                    <input
                      id="caseId"
                      name="caseId"
                      type="text"
                      value={columnMapping.caseId}
                      onChange={handleInputChange}
                      placeholder="Enter case ID column name"
                      className="w-80"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="activity">Activity column:</label>
                    <input
                      id="activity"
                      name="activity"
                      type="text"
                      value={columnMapping.activity}
                      onChange={handleInputChange}
                      placeholder="Enter activity column name"
                      className="w-80"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="resource">Resource column:</label>
                    <input
                      id="resource"
                      name="resource"
                      type="text"
                      value={columnMapping.resource}
                      onChange={handleInputChange}
                      placeholder="Enter resource column name"
                      className="w-80"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="startTimestamp">Start timestamp column:</label>
                    <input
                      id="startTimestamp"
                      name="startTimestamp"
                      type="text"
                      value={columnMapping.startTimestamp}
                      onChange={handleInputChange}
                      placeholder="Enter start timestamp column name"
                      className="w-80"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="endTimestamp">Start timestamp column:</label>
                    <input
                      id="endTimestamp"
                      name="endTimestamp"
                      type="text"
                      value={columnMapping.endTimestamp}
                      onChange={handleInputChange}
                      placeholder="Enter end timestamp column name"
                      className="w-80"
                    />
                  </div>
                </div>
                {errorMessage && <div className="bg-red-50 border-2 border-red-500 text-red-500">{errorMessage}</div>}
                <button type="button" className="w-2/3" onClick={handleSave} disabled={!submitEnabled}>
                  Save
                </button>
              </Form>
            </section>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
