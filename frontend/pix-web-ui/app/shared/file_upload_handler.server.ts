import YAML from "yaml";
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import { EventLogColumnMapping } from "~/components/asset-upload/column_mapping";
import { prosimosConfigurationDefaultValues } from "~/routes/projects.$projectId.$processingType/components/prosimos/schema";
import { AssetType } from "~/services/assets";
import { createAsset, deleteAsset } from "~/services/assets.server";
import type { File as File_ } from "~/services/files";
import { FileType, deleteFile, uploadFile } from "~/services/files.server";

export async function handleNewAssets(request: Request, projectId: string, token: string) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500000000, // 500 MB
  });
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  return await createAssetsFromForm(formData, projectId, token);
}

export async function handleNewAssetsFromFormData(formData: FormData, projectId: string, token: string) {
  return await createAssetsFromForm(formData, projectId, token);
}

async function createAssetsFromForm(formData: FormData, projectId: string, token: string) {
  const assetType = formData.get("assetType") as AssetType;

  switch (assetType) {
    case AssetType.EVENT_LOG:
      return await createEventLogFromForm(formData, projectId, token);
    case AssetType.PROCESS_MODEL:
      return await createProcessModelFromForm(formData, projectId, token);
    case AssetType.SIMULATION_MODEL:
      return await createSimulationModelFromForm(formData, projectId, token);
    case AssetType.SIMOD_CONFIGURATION:
      return await createSimodConfigurationFromForm(formData, projectId, token);
    case AssetType.OPTIMOS_CONFIGURATION:
      return await createOptimosConfigurationFromForm(formData, projectId, token);
    default:
      throw new Error(`Unknown asset type ${assetType}`);
  }
}

async function createEventLogFromForm(formData: FormData, projectId: string, token: string) {
  // event log has 2 files, event log (CSV or CSV.GZ) and column mapping (JSON)
  const eventLog = formData.get("eventLogFile") as File;
  const eventLogColumnMapping = formData.get("eventLogColumnMapping") as string;
  if (eventLog && eventLog.size > 0 && eventLogColumnMapping) {
    await uploadAndCreateEventLog(eventLog as File, eventLogColumnMapping as string, projectId, token);
  } else {
    throw new Error("Event log file or column mapping missing");
  }
}

async function createProcessModelFromForm(formData: FormData, projectId: string, token: string) {
  const processModel = formData.get("processModelFile") as File;
  if (processModel && processModel.size > 0) {
    await uploadAndCreateProcessModel(processModel as File, projectId, token);
  } else {
    throw new Error("Process model file missing");
  }
}

async function createSimulationModelFromForm(formData: FormData, projectId: string, token: string) {
  // simulation model has 2 files, simulation model (JSON) and process model (BPMN)
  let simulationModel = formData.get("simulationModelFile") as File;

  // if simulation model file missing, create a new one with default values
  if (!simulationModel || simulationModel.size === 0) {
    const jsonBlob = new Blob([JSON.stringify(prosimosConfigurationDefaultValues)], { type: "application/json" });
    simulationModel = new File([jsonBlob], `${uuidv4()}.json`);
  }

  const processModel = formData.get("processModelFile") as File;
  if (simulationModel && simulationModel.size > 0 && processModel && processModel.size > 0) {
    await uploadAndCreateSimulationModel(simulationModel as File, processModel as File, projectId, token);
  } else {
    throw new Error("Simulation model or process model file missing");
  }
}

async function createSimodConfigurationFromForm(formData: FormData, projectId: string, token: string) {
  // Simod configuration has 1 file, simod configuration (YAML)
  const simodConfiguration = formData.get("simodConfigurationFile") as File;
  if (simodConfiguration && simodConfiguration.size > 0) {
    await uploadAndCreateSimodConfiguration(simodConfiguration as File, projectId, token);
  } else {
    throw new Error("Simod configuration file missing");
  }
}

async function createOptimosConfigurationFromForm(formData: FormData, projectId: string, token: string) {
  // simulation model has 3 files, simulation model (JSON) and process model (BPMN) and optimos configuration (JSON)
  const optimosConfiguration = formData.get("optimosConfigurationFile") as File;
  const simulationModel = formData.get("simulationModelFile") as File;
  const processModel = formData.get("processModelFile") as File;
  if (
    optimosConfiguration &&
    optimosConfiguration.size > 0 &&
    simulationModel &&
    simulationModel.size > 0 &&
    processModel &&
    processModel.size > 0
  ) {
    await uploadAndCreateOptimosConfiguration(
      optimosConfiguration as File,
      simulationModel as File,
      processModel as File,
      projectId,
      token
    );
  } else {
    throw new Error("Optimos configuration file, simulation model or process model file missing");
  }
}

async function uploadAndCreateEventLog(
  eventLog: File,
  eventLogColumnMapping: string,
  projectID: string,
  token: string
) {
  const eventLogFileType = inferEventLogFileType(eventLog);
  const columnMappingFile = makeColumnMappingFileFromForm(eventLogColumnMapping);
  const files: FilePayload[] = [
    filePayloadFromFile(eventLog, eventLogFileType),
    filePayloadFromFile(columnMappingFile, FileType.EVENT_LOG_COLUMN_MAPPING_JSON),
  ];

  const uploadedFiles = await uploadFiles(files, token);

  return await createAssetFromUploadedFiles(
    {
      name: eventLog.name,
      files: uploadedFiles,
      type: AssetType.EVENT_LOG,
      projectID: projectID,
    },
    token
  );
}

async function uploadAndCreateProcessModel(processModel: File, projectID: string, token: string) {
  const uploadedFiles = await uploadFiles([filePayloadFromFile(processModel, FileType.PROCESS_MODEL_BPMN)], token);
  return await createAssetFromUploadedFiles(
    {
      name: processModel.name,
      files: uploadedFiles,
      type: AssetType.PROCESS_MODEL,
      projectID: projectID,
    },
    token
  );
}

async function uploadAndCreateSimulationModel(
  simulationModel: File,
  processModel: File,
  projectID: string,
  token: string
) {
  const uploadedFiles = await uploadFiles(
    [
      filePayloadFromFile(simulationModel, FileType.SIMULATION_MODEL_PROSIMOS_JSON),
      filePayloadFromFile(processModel, FileType.PROCESS_MODEL_BPMN),
    ],
    token
  );
  const name = processModel.name.split(".").slice(0, -1).join("."); // name is processModel.name without the .BPMN extension
  return await createAssetFromUploadedFiles(
    {
      name: name,
      files: uploadedFiles,
      type: AssetType.SIMULATION_MODEL,
      projectID: projectID,
    },
    token
  );
}

async function uploadAndCreateSimodConfiguration(simodConfiguration: File, projectID: string, token: string) {
  const uploadedFiles = await uploadFiles(
    [filePayloadFromFile(simodConfiguration, FileType.CONFIGURATION_SIMOD_YAML)],
    token
  );
  return await createAssetFromUploadedFiles(
    {
      name: simodConfiguration.name,
      files: uploadedFiles,
      type: AssetType.SIMOD_CONFIGURATION,
      projectID: projectID,
    },
    token
  );
}

async function uploadAndCreateOptimosConfiguration(
  optimosConfiguration: File,
  simulationModel: File,
  processModel: File,
  projectID: string,
  token: string
) {
  const uploadedFiles = await uploadFiles(
    [
      filePayloadFromFile(optimosConfiguration, FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON),
      filePayloadFromFile(simulationModel, FileType.SIMULATION_MODEL_PROSIMOS_JSON),
      filePayloadFromFile(processModel, FileType.PROCESS_MODEL_BPMN),
    ],
    token
  );
  return await createAssetFromUploadedFiles(
    {
      name: optimosConfiguration.name,
      files: uploadedFiles,
      type: AssetType.OPTIMOS_CONFIGURATION,
      projectID: projectID,
    },
    token
  );
}

function inferEventLogFileType(file: File) {
  const extension = file.name.split(".").pop();
  const fileType = extension === "gz" ? FileType.EVENT_LOG_CSV_GZ : FileType.EVENT_LOG_CSV;
  return fileType;
}

function filePayloadFromFile(file: File, fileType: FileType) {
  return { name: file.name, file, type: fileType };
}

function makeColumnMappingFileFromForm(mapping: string) {
  const columnMapping = EventLogColumnMapping.fromString(mapping);
  const columnMappingFile = new File([columnMapping.toString()], "column_mapping.json");
  return columnMappingFile;
}

type FilePayload = {
  name: string;
  file: File;
  type: FileType;
};

async function uploadFiles(files: FilePayload[], token: string) {
  let uploadedFiles;
  try {
    uploadedFiles = await Promise.all(
      files.map(async (filePayload) => {
        return await uploadFile(filePayload.file, filePayload.name, filePayload.type, token);
      })
    );
  } catch (e) {
    if (uploadedFiles) await Promise.all(uploadedFiles.map((file) => deleteFile(file.id, token)));
    throw e;
  }
  return uploadedFiles;
}
type AssetPayload = {
  name: string;
  files: File_[];
  type: AssetType;
  projectID: string;
};

async function createAssetFromUploadedFiles(payload: AssetPayload, token: string) {
  let createdAsset;
  try {
    const filesIDs = payload.files.map((file) => file.id);
    createdAsset = await createAsset(filesIDs, payload.name, payload.type, payload.projectID, token);
  } catch (e) {
    if (createdAsset) {
      await Promise.all([
        deleteAsset(createdAsset.id, token),
        ...payload.files.map((file) => deleteFile(file.id, token)),
      ]);
    }
    throw e;
  }
  return createdAsset;
}
