import { getProject } from "~/services/projects.server";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { handleThrow } from "~/utils";
import { requireLoggedInUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import Header from "~/components/Header";
import ProjectNav from "~/components/ProjectNav";
import UploadAssetDialog, { AssetType } from "~/components/upload/UploadAssetDialog";
import { deleteFile, uploadFile } from "~/services/files.server";
import { Asset, AssetTypeBackend, createAsset, deleteAsset, getAssetsForProject } from "~/services/assets.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    return json({ project: null });
  }

  const user = await requireLoggedInUser(request);

  return handleThrow(request, async () => {
    const project = await getProject(projectId, user.token!);
    const assets = await getAssetsForProject(projectId, user.token!);
    return json({ user, project, assets });
  });
}

export default function ProjectPage() {
  const { user, project, assets } = useLoaderData<typeof loader>();

  if (project) {
    return (
      <>
        <Header userEmail={user.email} />
        <ProjectNav project={project} />
        <section className="p-4 flex flex-col space-y-4">
          <h1 className="text-lg font-semibold">Project: {project.name}</h1>
          <div className="max-w-fit overflow-scroll border-4 border-blue-100">
            <table className="">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Creation time</th>
                  <th>File ID</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset: Asset) => (
                  <tr key={asset.id}>
                    <td className="truncate px-1">{asset.name}</td>
                    <td className="truncate px-1">{asset.type}</td>
                    <td className="truncate px-1">{asset.creation_time}</td>
                    <td className="truncate px-1">{asset.file_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <UploadAssetDialog trigger={<button>Upload asset</button>} />
        </section>
      </>
    );
  }

  return (
    <>
      <h1>Project not found</h1>
    </>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const projectId = await requireProjectIdInParams(params);

  await handleThrow(request, async () => {
    return await handleNewAssets(request, projectId, user.token!);
  });

  return redirect(`/projects/${params.projectId}`);
}

async function requireProjectIdInParams(params: Record<string, string | undefined>) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Error("No project ID in params");
  }
  return projectId;
}

async function handleNewAssets(request: Request, projectId: string, token: string) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000_000, // 500 MB
  });
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  return await createAssetsFromForm(formData, projectId, token);
}

async function createAssetsFromForm(formData: FormData, projectId: string, token: string) {
  let promises: Promise<Asset>[] = [];

  const eventLog = formData.get("eventLogFile") as File;
  if (eventLog && eventLog.size > 0) {
    promises.push(uploadFileAndCreateAssetWithRollback(eventLog as File, AssetType.EventLog, projectId, token));
  }

  const processModel = formData.get("processModelFile") as File;
  if (processModel && processModel.size > 0) {
    promises.push(uploadFileAndCreateAssetWithRollback(processModel as File, AssetType.ProcessModel, projectId, token));
  }

  const simulationModel = formData.get("simulationModelFile") as File;
  if (simulationModel && simulationModel.size > 0) {
    promises.push(
      uploadFileAndCreateAssetWithRollback(simulationModel as File, AssetType.SimulationModel, projectId, token)
    );
  }

  return await Promise.all(promises);
}

async function uploadFileAndCreateAssetWithRollback(
  file: File,
  assetType: AssetType,
  projectId: string,
  token: string
) {
  let createdFile;
  let createdAsset;
  try {
    createdFile = await uploadFile(file, token);
    const type = inferBackendAssetType(assetType, file.name);
    createdAsset = await createAsset(createdFile.id, file.name, type, projectId, token);
  } catch (e) {
    if (createdFile) await deleteFile(createdFile.id, token);
    if (createdAsset) await deleteAsset(createdAsset.id, token);
    throw e;
  }
  return createdAsset;
}

function inferBackendAssetType(assetType: AssetType, fileName: string) {
  const extension = fileName.split(".").pop();

  switch (assetType) {
    case AssetType.EventLog:
      if (extension === "csv") {
        return AssetTypeBackend.EVENT_LOG_CSV;
      } else if (extension === "gz") {
        return AssetTypeBackend.EVENT_LOG_CSV_GZ;
      } else {
        throw new Error(`Unknown event log extension ${extension}`);
      }
    case AssetType.ProcessModel:
      if (extension === "bpmn") {
        return AssetTypeBackend.PROCESS_MODEL_BPMN;
      } else {
        throw new Error(`Unknown process model extension ${extension}`);
      }
    case AssetType.SimulationModel:
      if (extension === "json") {
        return AssetTypeBackend.SIMULATION_MODEL_PROSIMOS_JSON;
      } else {
        throw new Error(`Unknown simulation model extension ${extension}`);
      }
  }
}
