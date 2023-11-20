import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import ProcessingApp from "~/components/processing/ProcessingApp";
import ProcessingMenu from "~/components/processing/ProcessingMenu";
import { UserContext } from "~/components/processing/contexts";
import { Asset } from "~/services/assets";
import { getAssetsForProject } from "~/services/assets.server";
import { ProcessingRequest, ProcessingRequestType } from "~/services/processing_requests";
import { createProcessingRequest, getProcessingRequestsForProject } from "~/services/processing_requests.server";
import { requireLoggedInUser } from "~/session.server";
import { AssetTypeBackend } from "~/shared/AssetTypeBackend";
import { handleThrow } from "~/utils";

export enum ProcessingType {
  Discovery = "discovery",
  Simulation = "simulation",
  WaitingTime = "waiting-time",
}

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

  const formData = await request.formData();
  const selectedInputAssetsIdsString = formData.get("selectedInputAssetsIds") as string;
  const selectedInputAssetsIds = selectedInputAssetsIdsString.split(",");

  const requestType = processingTypeToProcessingRequestType(processingType as ProcessingType);
  const shouldNotify = true;
  await createProcessingRequest(requestType, projectId, selectedInputAssetsIds, shouldNotify, user.token!);

  return null;
};

export default function ProcessingPage() {
  const { processingType, assets, processingRequests, user, projectId } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-[3rem_2fr_8fr_2fr]">
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <ProcessingMenu projectId={projectId} />
      </div>
      <UserContext.Provider value={user}>
        <ProcessingApp assets={assets} processingType={processingType} processingRequests={processingRequests} />
      </UserContext.Provider>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <div className="p-4 bg-red-400">Route error</div>;
  }
  return <div className="p-4 bg-red-400">Some other error</div>;
}

function filterAssetsByType(assets: Asset[], processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return assets.filter(
        (asset) => asset.type === AssetTypeBackend.EVENT_LOG || asset.type === AssetTypeBackend.PROCESS_MODEL
      );
    case ProcessingType.Simulation:
      return assets.filter((asset) => asset.type === AssetTypeBackend.SIMULATION_MODEL);
    case ProcessingType.WaitingTime:
      return assets.filter((asset) => asset.type === AssetTypeBackend.EVENT_LOG);
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
