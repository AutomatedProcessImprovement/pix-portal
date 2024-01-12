import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useMatches, useRouteError } from "@remix-run/react";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
import { getAssetsForProject } from "~/services/assets.server";
import type { ProcessingRequest } from "~/services/processing_requests";
import { ProcessingRequestType } from "~/services/processing_requests";
import { createProcessingRequest, getProcessingRequestsForProject } from "~/services/processing_requests.server";
import { handleNewAssetsFromFormData } from "~/shared/file_upload_handler.server";
import { requireLoggedInUser } from "~/shared/guards.server";
import { ProcessingType } from "~/shared/processing_type";
import { handleThrow } from "~/shared/utils";
import ProcessingApp from "./components/ProcessingApp";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const processingType = params.processingType as string;
  const projectId = params.projectId as string;
  ensureProcessingTypeValidOrRedirect(processingType, projectId);

  const user = await requireLoggedInUser(request);

  return handleThrow(request, async () => {
    let assets = await getAssetsForProject(projectId, user.token!);
    assets = filterAssetsByType(assets, processingType as ProcessingType);

    let processingRequests = await getProcessingRequestsForProject(projectId, user.token!);
    processingRequests = filterRequestsByType(processingRequests, processingType as ProcessingType);

    return json({ assets, processingType, processingRequests, user, projectId });
  });
};

function ensureProcessingTypeValidOrRedirect(processingType: string, projectId: string) {
  if (!Object.values(ProcessingType).includes(processingType as ProcessingType)) {
    throw redirect(`/projects/${projectId}`);
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await requireLoggedInUser(request);

  const processingType = params.processingType as string;
  const projectId = params.projectId as string;
  ensureProcessingTypeValidOrRedirect(processingType, projectId);

  // Either handle asset upload --
  let formData: FormData;
  // calling request.formData() and unstable_parseMultipartFormData() reads the request body twice,
  // which crashes remix. See github.com/remix-run/remix/discussions/7660
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 500000000, // 500 MB
    });
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
  } else {
    formData = await request.formData();
  }
  const assetType = formData.get("assetType");
  if (assetType) {
    await handleThrow(request, async () => {
      return await handleNewAssetsFromFormData(formData, projectId, user.token!);
    });
    return null;
  }

  // -- or handle processing request creation
  const selectedInputAssetsIdsString = formData.get("selectedInputAssetsIds") as string;
  const selectedInputAssetsIds = selectedInputAssetsIdsString.split(",");
  const requestType = processingTypeToProcessingRequestType(processingType as ProcessingType);
  const shouldNotify = true;
  await createProcessingRequest(requestType, projectId, selectedInputAssetsIds, shouldNotify, user.token!);
  return null;
};

export default function ProcessingPage() {
  const { processingType, assets, processingRequests, projectId } = useLoaderData<typeof loader>();

  const matches = useMatches();

  return (
    <main className="grow grid grid-cols-[minmax(0,3fr)_minmax(0,9fr)_minmax(0,3fr)] bg-slate-50">
      <ProcessingApp assets={assets} processingType={processingType} processingRequests={processingRequests} />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("error", error);
  if (isRouteErrorResponse(error)) {
    return <div className="p-4 bg-red-400">Route error</div>;
  }
  return <div className="p-4 bg-red-400">Some other error</div>;
}

function filterAssetsByType(assets: Asset[], processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return assets.filter((asset) => asset.type === AssetType.EVENT_LOG || asset.type === AssetType.PROCESS_MODEL);
    case ProcessingType.Simulation:
      return assets.filter((asset) => asset.type === AssetType.SIMULATION_MODEL);
    case ProcessingType.WaitingTime:
      return assets.filter((asset) => asset.type === AssetType.EVENT_LOG);
    default:
      throw new Error("Invalid processing type");
  }
}

function filterRequestsByType(processingRequests: ProcessingRequest[], processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return processingRequests.filter((r) => r.type === ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_SIMOD);
    case ProcessingType.Simulation:
      return processingRequests.filter((r) => r.type === ProcessingRequestType.SIMULATION_PROSIMOS);
    case ProcessingType.WaitingTime:
      return processingRequests.filter((r) => r.type === ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS);
    default:
      throw new Error("Invalid processing type");
  }
}

function processingTypeToProcessingRequestType(processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_SIMOD;
    case ProcessingType.Simulation:
      return ProcessingRequestType.SIMULATION_PROSIMOS;
    case ProcessingType.WaitingTime:
      return ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS;
    default:
      throw new Error("Invalid processing type");
  }
}
