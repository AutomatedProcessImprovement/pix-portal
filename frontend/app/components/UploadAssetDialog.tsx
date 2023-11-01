import { ReactNode, useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ActionFunctionArgs } from "@remix-run/node";
import UploadAssetSelect from "~/components/UploadAssetSelect";
import { Form } from "@remix-run/react";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

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

            {/*<nav className="flex items-center justify-start space-x-2">*/}
            {/*  <button type="button" onClick={submitForms}>*/}
            {/*    Submit*/}
            {/*  </button>*/}
            {/*  <button onClick={() => setIsOpen(false)}>Close</button>*/}
            {/*</nav>*/}
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
          <DragAndDrop assetType={assetType} />
        </div>
      );
    case AssetType.ProcessModel:
      return (
        <div>
          <div id="description">
            <p>BPMN files are XML files containing a BPMN model.</p>
          </div>
          <DragAndDrop assetType={assetType} />
        </div>
      );
    case AssetType.SimulationModel:
      return (
        <div>
          <div id="description">
            <p>BPS model consists of two files: a BPMN model and simulation parameters in JSON format.</p>
          </div>
          <DragAndDrop assetType={assetType} />
        </div>
      );
    default:
      return <div>Unknown asset type</div>;
  }
}

export function DragAndDrop({ assetType }: { assetType: AssetType }) {
  const [eventLogDragActive, setEventLogDragActive] = useState<boolean>(false);
  const [processModelDragActive, setProcessModelDragActive] = useState<boolean>(false);
  const [simulationModelDragActive, setSimulationModelDragActive] = useState<boolean>(false);

  const eventLogInputRef = useRef<any>(null);
  const processModelInputRef = useRef<any>(null);
  const simulationModelInputRef = useRef<any>(null);

  const [eventLogFile, setEventLogFile] = useState<any>(null);
  const [processModelFile, setProcessModelFile] = useState<any>(null);
  const [simulationModelFile, setSimulationModelFile] = useState<any>(null);

  const validFileTypes = {
    "Event Log": [".csv", ".gz"], // it's .gz and not .csv.gz because only the last suffix is considered by the browser
    "Process Model": [".bpmn"],
    "Simulation Model": [".json"],
  };

  function getValidFileTypes(assetType: AssetType) {
    return validFileTypes[assetType].join(", ");
  }

  function preventDefaultStopPropagation(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function submitForm(e: any) {
    // e.preventDefault();

    // TODO: submit files using axios and backend without Remix action
    const files = [];
    if (assetType === AssetType.EventLog && eventLogFile) {
      files.push(eventLogFile);
    } else if (assetType === AssetType.ProcessModel && processModelFile) {
      files.push(processModelFile);
    } else if (assetType === AssetType.SimulationModel && processModelFile && simulationModelFile) {
      files.push(processModelFile);
      files.push(simulationModelFile);
    } else {
      console.error("Unknown asset type", assetType);
      return;
    }

    console.log("Uploading files", files);

    // TODO: finish uploading files and handling responses; write a service for this
  }

  return (
    <div className="flex items-center justify-center my-4">
      <Form id="new-asset" method="post" className="flex flex-col items-center justify-center space-y-5">
        <input type="hidden" name="assetType" value={assetType} />

        {/* Hidden input element that hold actual files and allows and allow to select files for upload on the button click. */}
        <input
          type="file"
          name="eventLogFile"
          ref={eventLogInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.EventLog)}
          onChange={(e: any) => {
            e.preventDefault();
            const file = e.target.files[0];
            setEventLogFile(file);
          }}
        />
        <input
          type="file"
          name="processModelFile"
          ref={processModelInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.ProcessModel)}
          onChange={(e: any) => {
            e.preventDefault();
            const file = e.target.files[0];
            setProcessModelFile(file);
          }}
        />
        <input
          type="file"
          name="simulationModelFile"
          ref={simulationModelInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.SimulationModel)}
          onChange={(e: any) => {
            e.preventDefault();
            const file = e.target.files[0];
            setSimulationModelFile(file);
          }}
        />

        {assetType === AssetType.EventLog && (
          <div
            className={`${
              eventLogDragActive ? "bg-blue-100" : "bg-gray-50"
            } upload-form border-4 border-blue-100 hover:border-blue-500 py-3 px-4 rounded-lg text-center flex flex-col items-center justify-center space-y-5`}
            onDragEnter={(e) => {
              preventDefaultStopPropagation(e);
              setEventLogDragActive(true);
              if (eventLogFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
            onSubmit={(e) => {
              preventDefaultStopPropagation(e);
              // TODO: submit form
            }}
            onDrop={(e) => {
              preventDefaultStopPropagation(e);
              setEventLogDragActive(false);
              if (eventLogFile) {
                e.dataTransfer.dropEffect = "none";
                return;
              }
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setEventLogFile(file);
                eventLogInputRef.current.files = e.dataTransfer.files;
                console.log("eventLogInputRef.current.files", eventLogInputRef.current.files);
              }
            }}
            onDragLeave={(e) => {
              preventDefaultStopPropagation(e);
              setEventLogDragActive(false);
              if (eventLogFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
            onDragOver={(e) => {
              preventDefaultStopPropagation(e);
              setEventLogDragActive(true);
              if (eventLogFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
          >
            {/* Instructions and controls */}
            <p className="text-lg mb-4 font-semibold">Add {assetType}</p>
            <p className="">
              Drag & Drop or{" "}
              <span
                className="border border-blue-500 bg-white hover:bg-blue-50 rounded-md px-2 py-1 font-normal text-blue-600 cursor-pointer"
                onClick={() => {
                  eventLogInputRef.current.value = "";
                  eventLogInputRef.current.click();
                }}
              >
                {`select a file`}
              </span>{" "}
              to upload
            </p>

            {/* Added files */}
            {eventLogFile && (
              <div className="flex flex-col items-center p-3 mt-4">
                <div
                  key="event-log-file"
                  className="border-4 border-blue-100 bg-indigo-50 w-72 px-4 py-2 rounded-2xl flex space-x-2 my-1"
                >
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-10 w-auto text-blue-500" />
                  </div>
                  <div className="flex flex-column flex-wrap max-w-sm overflow-hidden">
                    <p className="truncate font-semibold text-blue-900">{eventLogFile.name}</p>
                    <div
                      className="flex text-blue-500 hover:text-blue-600 cursor-pointer text-sm font-semibold"
                      onClick={() => {
                        setEventLogFile(null);
                        eventLogInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {assetType === AssetType.ProcessModel && (
          <div
            className={`${
              processModelDragActive ? "bg-blue-100" : "bg-gray-50"
            } upload-form border-4 border-blue-100 hover:border-blue-500 py-3 px-4 rounded-lg text-center flex flex-col items-center justify-center space-y-5`}
            onDragEnter={(e) => {
              preventDefaultStopPropagation(e);
              setProcessModelDragActive(true);
              if (processModelFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
            onSubmit={(e) => {
              preventDefaultStopPropagation(e);
              // TODO: submit form
            }}
            onDrop={(e) => {
              preventDefaultStopPropagation(e);
              setProcessModelDragActive(false);
              if (processModelFile) {
                e.dataTransfer.dropEffect = "none";
                return;
              }
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setProcessModelFile(file);
                processModelInputRef.current.files = e.dataTransfer.files;
              }
            }}
            onDragLeave={(e) => {
              preventDefaultStopPropagation(e);
              setProcessModelDragActive(false);
              if (processModelFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
            onDragOver={(e) => {
              preventDefaultStopPropagation(e);
              setProcessModelDragActive(true);
              if (processModelFile) {
                e.dataTransfer.dropEffect = "none";
              }
            }}
          >
            {/*/!* Input element that allows to select files for upload. We make it hidden, so we can activate it when the user clicks select files *!/*/}
            {/*<input*/}
            {/*  placeholder="fileInput"*/}
            {/*  className="hidden"*/}
            {/*  ref={inputRef}*/}
            {/*  type="file"*/}
            {/*  multiple={true}*/}
            {/*  onChange={(e: any) => {*/}
            {/*    const file = e.target.files[0];*/}
            {/*    setProcessModelFile(file);*/}
            {/*  }}*/}
            {/*  accept={getValidFileTypes(assetType)}*/}
            {/*/>*/}

            {/* Instructions and controls */}
            <p className="text-lg mb-4 font-semibold">Add {assetType}</p>
            <p className="">
              Drag & Drop or{" "}
              <span
                className="border border-blue-500 bg-white hover:bg-blue-50 rounded-md px-2 py-1 font-normal text-blue-600 cursor-pointer"
                onClick={() => {
                  processModelInputRef.current.value = "";
                  processModelInputRef.current.click();
                }}
              >
                {`select a file`}
              </span>{" "}
              to upload
            </p>

            {/* Added files */}
            {assetType === AssetType.ProcessModel && processModelFile && (
              <div className="flex flex-col items-center p-3 mt-4">
                <div
                  key="process-model-file"
                  className="border-4 border-blue-100 bg-indigo-50 w-72 px-4 py-2 rounded-2xl flex space-x-2 my-1"
                >
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-10 w-auto text-blue-500" />
                  </div>
                  <div className="flex flex-column flex-wrap max-w-sm overflow-hidden">
                    <p className="truncate font-semibold text-blue-900">{processModelFile.name}</p>
                    <div
                      className="flex text-blue-500 hover:text-blue-600 cursor-pointer text-sm font-semibold"
                      onClick={() => {
                        setProcessModelFile(null);
                        processModelInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {assetType === AssetType.SimulationModel && (
          <>
            {/* Process Model */}
            <div
              className={`${
                processModelDragActive ? "bg-blue-100" : "bg-gray-50"
              } upload-form border-4 border-blue-100 hover:border-blue-500 py-3 px-4 rounded-lg text-center flex flex-col items-center justify-center space-y-5`}
              onDragEnter={(e) => {
                preventDefaultStopPropagation(e);
                setProcessModelDragActive(true);
                if (processModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
              onSubmit={(e) => {
                preventDefaultStopPropagation(e);
                // TODO: submit form
              }}
              onDrop={(e) => {
                preventDefaultStopPropagation(e);
                setProcessModelDragActive(false);
                if (processModelFile) {
                  e.dataTransfer.dropEffect = "none";
                  return;
                }
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setProcessModelFile(file);
                  processModelInputRef.current.files = e.dataTransfer.files;
                }
              }}
              onDragLeave={(e) => {
                preventDefaultStopPropagation(e);
                setProcessModelDragActive(false);
                if (processModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
              onDragOver={(e) => {
                preventDefaultStopPropagation(e);
                setProcessModelDragActive(true);
                if (processModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
            >
              {/*/!* Input element that allows to select files for upload. We make it hidden, so we can activate it when the user clicks select files *!/*/}
              {/*<input*/}
              {/*  placeholder="fileInput"*/}
              {/*  className="hidden"*/}
              {/*  ref={inputRef}*/}
              {/*  type="file"*/}
              {/*  multiple={true}*/}
              {/*  onChange={(e: any) => {*/}
              {/*    const file = e.target.files[0];*/}
              {/*    setSimulationModelFile(file);*/}
              {/*  }}*/}
              {/*  accept={getValidFileTypes(assetType)}*/}
              {/*/>*/}

              {/* Instructions and controls */}
              <p className="text-lg font-semibold">Add {AssetType.ProcessModel}</p>
              <p className="">
                Drag & Drop or{" "}
                <span
                  className="border border-blue-500 bg-white hover:bg-blue-50 rounded-md px-2 py-1 font-normal text-blue-600 cursor-pointer"
                  onClick={() => {
                    processModelInputRef.current.value = "";
                    processModelInputRef.current.click();
                  }}
                >
                  {`select a file`}
                </span>{" "}
                to upload
              </p>

              {/* Added files */}
              {assetType === AssetType.SimulationModel && processModelFile && (
                <div className="flex flex-col items-center p-3 mt-4">
                  <div
                    key="process-model-file"
                    className="border-4 border-blue-100 bg-indigo-50 w-72 px-4 py-2 rounded-2xl flex space-x-2 my-1"
                  >
                    <div className="flex items-center">
                      <DocumentArrowUpIcon className="h-10 w-auto text-blue-500" />
                    </div>
                    <div className="flex flex-column flex-wrap max-w-sm overflow-hidden">
                      <p className="truncate font-semibold text-blue-900">{processModelFile.name}</p>
                      <div
                        className="flex text-blue-500 hover:text-blue-600 cursor-pointer text-sm font-semibold"
                        onClick={() => {
                          setProcessModelFile(null);
                          processModelInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Parameters */}
            <div
              className={`${
                simulationModelDragActive ? "bg-blue-100" : "bg-gray-50"
              } upload-form border-4 border-blue-100 hover:border-blue-500 py-3 px-4 rounded-lg text-center flex flex-col items-center justify-center space-y-5`}
              onDragEnter={(e) => {
                preventDefaultStopPropagation(e);
                setSimulationModelDragActive(true);
                if (simulationModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
              onSubmit={(e) => {
                preventDefaultStopPropagation(e);
                // TODO: submit form
              }}
              onDrop={(e) => {
                preventDefaultStopPropagation(e);
                setSimulationModelDragActive(false);
                if (simulationModelFile) {
                  e.dataTransfer.dropEffect = "none";
                  return;
                }
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setSimulationModelFile(file);
                  simulationModelInputRef.current.files = e.dataTransfer.files;
                }
              }}
              onDragLeave={(e) => {
                preventDefaultStopPropagation(e);
                setSimulationModelDragActive(false);
                if (simulationModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
              onDragOver={(e) => {
                preventDefaultStopPropagation(e);
                setSimulationModelDragActive(true);
                if (simulationModelFile) {
                  e.dataTransfer.dropEffect = "none";
                }
              }}
            >
              {/* Instructions and controls */}
              <p className="text-lg font-semibold">Add {AssetType.SimulationModel}</p>
              <p className="">
                Drag & Drop or{" "}
                <span
                  className="border border-blue-500 bg-white hover:bg-blue-50 rounded-md px-2 py-1 font-normal text-blue-600 cursor-pointer"
                  onClick={() => {
                    simulationModelInputRef.current.value = "";
                    simulationModelInputRef.current.click();
                  }}
                >
                  {`select a file`}
                </span>{" "}
                to upload
              </p>

              {/* Added files */}
              {assetType === AssetType.SimulationModel && simulationModelFile && (
                <div className="flex flex-col items-center p-3 mt-4">
                  <div
                    key="simulation-model-file"
                    className="border-4 border-blue-100 bg-indigo-50 w-72 px-4 py-2 rounded-2xl flex space-x-2 my-1"
                  >
                    <div className="flex items-center">
                      <DocumentArrowUpIcon className="h-10 w-auto text-blue-500" />
                    </div>
                    <div className="flex flex-column flex-wrap max-w-sm overflow-hidden">
                      <p className="truncate font-semibold text-blue-900">{simulationModelFile.name}</p>
                      <div
                        className="flex text-blue-500 hover:text-blue-600 cursor-pointer text-sm font-semibold"
                        onClick={() => {
                          setSimulationModelFile(null);
                          simulationModelInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <button type="submit" onClick={submitForm}>
          Submit
        </button>
      </Form>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("Uploading asset...", request);
}
