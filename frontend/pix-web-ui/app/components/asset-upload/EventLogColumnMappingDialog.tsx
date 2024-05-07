import { Dialog } from "@headlessui/react";
import { Form } from "@remix-run/react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { EventLogColumnMapping } from "~/components/asset-upload/column_mapping";

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
  const [submitEnabled, setSubmitEnabled] = useState(columnMapping.isValid());

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [submitEnabled, isOpen]);

  useEffect(() => {
    const valid = columnMapping.isValid();
    setSubmitEnabled(valid);
    setColumnMappingFilledIn(valid);
  }, [columnMapping, setColumnMappingFilledIn]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setColumnMapping(new EventLogColumnMapping({ ...columnMapping, [name]: value }));
  }

  function handleSave() {
    if (columnMapping.isValid()) {
      setColumnMappingFilledIn(true);
      setIsOpen(false);
    } else {
      setColumnMappingFilledIn(false);
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
                    <label htmlFor="case">Case ID column:</label>
                    <input
                      id="case"
                      name="case"
                      type="text"
                      value={columnMapping.case}
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
                    <label htmlFor="start_time">Start timestamp column:</label>
                    <input
                      id="start_time"
                      name="start_time"
                      type="text"
                      value={columnMapping.start_time}
                      onChange={handleInputChange}
                      placeholder="Enter start timestamp column name"
                      className="w-80"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="end_time">End timestamp column:</label>
                    <input
                      id="end_time"
                      name="end_time"
                      type="text"
                      value={columnMapping.end_time}
                      onChange={handleInputChange}
                      placeholder="Enter end timestamp column name"
                      className="w-80"
                    />
                  </div>
                </div>
                <button type="button" className="w-2/3" onClick={handleSave} disabled={!submitEnabled} autoFocus={true}>
                  Confirm
                </button>
              </Form>
            </section>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
