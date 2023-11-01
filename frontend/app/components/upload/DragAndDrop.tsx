import { useEffect, useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { AssetType } from "~/components/upload/UploadAssetDialog";

export function DragAndDrop({ assetType }: { assetType: AssetType }) {
  // DragAndDrop component is used to upload files to the server. It keeps track of three different asset types:
  // Event Log, Process Model, Simulation Model. All asset types have a corresponding drag and drop area and a hidden
  // input element to store the actual file. The Simulation Model consists of two assets, thus, it has two drag and drop
  // areas and two hidden input elements to store the Process Model and Simulation Model files.

  const navigation = useNavigation();

  // These are used to store the actual files and are hidden from the user.
  const eventLogInputRef = useRef<any>(null);
  const processModelInputRef = useRef<any>(null);
  const simulationModelInputRef = useRef<any>(null);

  // These are used only for UI purposes to update the state of drag and drop areas.
  const [eventLogFile, setEventLogFile] = useState<any>(null);
  const [processModelFile, setProcessModelFile] = useState<any>(null);
  const [simulationModelFile, setSimulationModelFile] = useState<any>(null);

  // Flags to indicate whether the drag and drop areas are active.
  const [eventLogDragActive, setEventLogDragActive] = useState<boolean>(false);
  const [processModelDragActive, setProcessModelDragActive] = useState<boolean>(false);
  const [simulationModelDragActive, setSimulationModelDragActive] = useState<boolean>(false);

  const [submitEnabled, setSubmitEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (navigation.state === "submitting") {
      setSubmitEnabled(false);
      return;
    }

    switch (assetType) {
      case AssetType.EventLog:
        setSubmitEnabled(!!eventLogFile);
        break;
      case AssetType.ProcessModel:
        setSubmitEnabled(!!processModelFile);
        break;
      case AssetType.SimulationModel:
        setSubmitEnabled(!!processModelFile && !!simulationModelFile);
        break;
    }
  }, [assetType, eventLogFile, processModelFile, simulationModelFile]);

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

  function onHiddenInputChange(e: any, assetType: AssetType) {
    e.preventDefault();
    const file = e.target.files[0];
    switch (assetType) {
      case AssetType.EventLog:
        setEventLogFile(file);
        break;
      case AssetType.ProcessModel:
        setProcessModelFile(file);
        break;
      case AssetType.SimulationModel:
        setSimulationModelFile(file);
        break;
    }
  }

  function onDragEnterOrLeaveOrOver(e: any, assetType: AssetType, dragActive: boolean) {
    preventDefaultStopPropagation(e);

    let fileExists = false;
    switch (assetType) {
      case AssetType.EventLog:
        fileExists = !!eventLogFile;
        setEventLogDragActive(dragActive);
        break;
      case AssetType.ProcessModel:
        fileExists = !!processModelFile;
        setProcessModelDragActive(dragActive);
        break;
      case AssetType.SimulationModel:
        fileExists = !!simulationModelFile;
        setSimulationModelDragActive(dragActive);
        break;
    }

    if (fileExists) {
      e.dataTransfer.dropEffect = "none";
    }
  }

  function onDragDrop(e: any, assetType: AssetType) {
    onDragEnterOrLeaveOrOver(e, assetType, false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      switch (assetType) {
        case AssetType.EventLog:
          setEventLogFile(file);
          eventLogInputRef.current.files = e.dataTransfer.files;
          break;
        case AssetType.ProcessModel:
          setProcessModelFile(file);
          processModelInputRef.current.files = e.dataTransfer.files;
          break;
        case AssetType.SimulationModel:
          setSimulationModelFile(file);
          simulationModelInputRef.current.files = e.dataTransfer.files;
          break;
      }
    }
  }

  function onRemoveClick(assetType: AssetType) {
    switch (assetType) {
      case AssetType.EventLog:
        setEventLogFile(null);
        eventLogInputRef.current.value = "";
        break;
      case AssetType.ProcessModel:
        setProcessModelFile(null);
        processModelInputRef.current.value = "";
        break;
      case AssetType.SimulationModel:
        setSimulationModelFile(null);
        simulationModelInputRef.current.value = "";
        break;
    }
  }

  function openFileBrowser(assetType: AssetType) {
    switch (assetType) {
      case AssetType.EventLog:
        eventLogInputRef.current.value = "";
        eventLogInputRef.current.click();
        break;
      case AssetType.ProcessModel:
        processModelInputRef.current.value = "";
        processModelInputRef.current.click();
        break;
      case AssetType.SimulationModel:
        simulationModelInputRef.current.value = "";
        simulationModelInputRef.current.click();
        break;
    }
  }

  function onSubmit() {
    // Clean up inputs.

    switch (assetType) {
      case AssetType.EventLog:
        processModelInputRef.current.value = "";
        simulationModelInputRef.current.value = "";
        break;
      case AssetType.ProcessModel:
        eventLogInputRef.current.value = "";
        simulationModelInputRef.current.value = "";
        break;
      case AssetType.SimulationModel:
        eventLogInputRef.current.value = "";
        break;
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Form method="post" encType="multipart/form-data" className="flex flex-col items-center justify-center space-y-8">
        {/* Hidden input element that hold actual files and allows and allow to select files for upload on the button click. */}
        <input
          type="file"
          name="eventLogFile"
          ref={eventLogInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.EventLog)}
          onChange={(e: any) => onHiddenInputChange(e, AssetType.EventLog)}
        />
        <input
          type="file"
          name="processModelFile"
          ref={processModelInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.ProcessModel)}
          onChange={(e: any) => onHiddenInputChange(e, AssetType.ProcessModel)}
        />
        <input
          type="file"
          name="simulationModelFile"
          ref={simulationModelInputRef}
          className="hidden"
          accept={getValidFileTypes(AssetType.SimulationModel)}
          onChange={(e: any) => onHiddenInputChange(e, AssetType.SimulationModel)}
        />

        {assetType === AssetType.EventLog && (
          <DragAndDropContainer
            file={eventLogFile}
            assetType={assetType}
            dragActiveFlag={eventLogDragActive}
            onDragEnter={(e) => onDragEnterOrLeaveOrOver(e, assetType, true)}
            onDragLeave={(e) => onDragEnterOrLeaveOrOver(e, assetType, false)}
            onDrop={(e) => onDragDrop(e, assetType)}
            onSelectFile={() => openFileBrowser(assetType)}
            onRemove={() => onRemoveClick(assetType)}
          />
        )}

        {assetType === AssetType.ProcessModel && (
          <DragAndDropContainer
            file={processModelFile}
            assetType={assetType}
            dragActiveFlag={processModelDragActive}
            onDragEnter={(e) => onDragEnterOrLeaveOrOver(e, assetType, true)}
            onDragLeave={(e) => onDragEnterOrLeaveOrOver(e, assetType, false)}
            onDrop={(e) => onDragDrop(e, assetType)}
            onSelectFile={() => openFileBrowser(assetType)}
            onRemove={() => onRemoveClick(assetType)}
          />
        )}

        {assetType === AssetType.SimulationModel && (
          <div className="flex flex-wrap items-center justify-center">
            {/* Process Model */}
            <DragAndDropContainer
              file={processModelFile}
              assetType={AssetType.ProcessModel}
              dragActiveFlag={processModelDragActive}
              onDragEnter={(e) => onDragEnterOrLeaveOrOver(e, AssetType.ProcessModel, true)}
              onDragLeave={(e) => onDragEnterOrLeaveOrOver(e, AssetType.ProcessModel, false)}
              onDrop={(e) => onDragDrop(e, AssetType.ProcessModel)}
              onSelectFile={() => openFileBrowser(AssetType.ProcessModel)}
              onRemove={() => onRemoveClick(AssetType.ProcessModel)}
            />

            {/* Simulation Parameters */}
            <DragAndDropContainer
              file={simulationModelFile}
              assetType={assetType}
              dragActiveFlag={simulationModelDragActive}
              onDragEnter={(e) => onDragEnterOrLeaveOrOver(e, assetType, true)}
              onDragLeave={(e) => onDragEnterOrLeaveOrOver(e, assetType, false)}
              onDrop={(e) => onDragDrop(e, assetType)}
              onSelectFile={() => openFileBrowser(assetType)}
              onRemove={() => onRemoveClick(assetType)}
            />
          </div>
        )}

        <button className="w-48" type="submit" onClick={onSubmit} disabled={!submitEnabled}>
          {navigation.state === "submitting" ? "Uploading..." : "Upload"}
        </button>
      </Form>
    </div>
  );
}

function DragAndDropContainer(props: {
  file: any;
  assetType: AssetType;
  dragActiveFlag: boolean;
  onDragEnter: (e: any) => void;
  onDragLeave: (e: any) => void;
  onDrop: (e: any) => void;
  onSelectFile: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`${
        props.dragActiveFlag ? "bg-blue-100" : "bg-gray-50"
      } upload-form border-4 border-blue-100 hover:border-blue-500 m-4 py-3 px-4 rounded-lg text-center flex flex-col items-center justify-center space-y-5`}
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragEnter}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
    >
      <DragAndDropHeader assetType={props.assetType} onSelectFile={props.onSelectFile} />
      <DroppedFile file={props.file} onRemove={props.onRemove} />
    </div>
  );
}

function DragAndDropHeader(props: { assetType: AssetType; onSelectFile: () => void }) {
  // Header of the drag-and-drop area, additional instructions, and controls.

  return (
    <div>
      <p className="text-lg mb-4 font-semibold">Add {props.assetType}</p>
      <p className="">
        Drag & Drop or{" "}
        <span
          className="border border-blue-500 bg-white hover:bg-blue-50 rounded-md px-2 py-1 font-normal text-blue-600 cursor-pointer"
          onClick={props.onSelectFile}
        >
          {`select a file`}
        </span>{" "}
        to upload
      </p>
    </div>
  );
}

function DroppedFile(props: { file?: any; onRemove: () => void }) {
  if (props.file) {
    return (
      <div className="flex flex-col items-center p-3 mt-4">
        <div className="border-4 border-blue-100 bg-indigo-50 w-72 px-4 py-2 rounded-2xl flex space-x-2 my-1">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-10 w-auto text-blue-500" />
          </div>
          <div className="flex flex-column flex-wrap max-w-sm overflow-hidden">
            <p className="truncate font-semibold text-blue-900">{props.file.name}</p>
            <div
              className="flex text-blue-500 hover:text-blue-600 cursor-pointer text-sm font-semibold"
              onClick={props.onRemove}
            >
              Remove
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
