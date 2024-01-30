import type { ActionFunctionArgs, LoaderFunctionArgs, Session } from "@remix-run/node";
import { json, redirect, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Asset } from "~/services/assets";
// TODO: Remix pushes for codebase separation into server and client-side code. Often, it doesn't make sesnse,
//   because we need to call the code from both sides. It's became obvious with time. So, in the end, it led to code
//   duplication in the ./app/services folder. For example, in assets.ts and assets.server.ts, we have similar
//   functionality implemented. As a rule of thumb, it's better to go client-side first, and use *.server.ts only
//   when necessary. Also, we need to review the services folder and refactor it to simplify the fetching.
import { AssetType, getAssetsForProject as getAssetsForProjectOnClient } from "~/services/assets";
import { getAssetsForProject } from "~/services/assets.server";
import type { ProcessingRequest } from "~/services/processing_requests";
import { ProcessingRequestType } from "~/services/processing_requests";
import { createProcessingRequest, getProcessingRequestsForProject } from "~/services/processing_requests.server";
import { handleNewAssetsFromFormData } from "~/shared/file_upload_handler.server";
import { FlashMessage } from "~/shared/flash_message";
import { requireLoggedInUser } from "~/shared/guards.server";
import { ProcessingType } from "~/shared/processing_type";
import { getFlashMessage, sessionStorage } from "~/shared/session.server";
import { handleThrow } from "~/shared/utils";
import { useFlashMessage } from "../_index/route";
import ProcessingApp from "./components/ProcessingApp";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const [flashMessage, session] = await getFlashMessage(request);
  const processingType = params.processingType as string;
  const projectId = params.projectId as string;
  await ensureProcessingTypeValidOrRedirect(processingType, projectId, session);
  const user = await requireLoggedInUser(request);

  return handleThrow(request, async () => {
    let assets = await getAssetsForProject(projectId, user.token!);
    assets = filterAssetsByType(assets, processingType as ProcessingType);

    let processingRequests = await getProcessingRequestsForProject(projectId, user.token!);
    processingRequests = filterRequestsByType(processingRequests, processingType as ProcessingType);

    return json(
      { assets, processingType, processingRequests, user, projectId, flashMessage },
      { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
    );
  });
};

async function ensureProcessingTypeValidOrRedirect(processingType: string, projectId: string, session: Session) {
  if (!Object.values(ProcessingType).includes(processingType as ProcessingType)) {
    session.flash("flash", { message: "No such processing option", type: "error" } as FlashMessage);
    throw redirect(`/projects/${projectId}`, {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await requireLoggedInUser(request);

  const processingType = params.processingType as string;
  const projectId = params.projectId as string;
  const [, session] = await getFlashMessage(request);
  ensureProcessingTypeValidOrRedirect(processingType, projectId, session);

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
      console.log("route formData", formData);
      return await handleNewAssetsFromFormData(formData, projectId, user.token!);
    });
    return null;
  }

  // -- or handle processing request creation
  const selectedInputAssetsIdsString = formData.get("selectedInputAssetsIds") as string;
  const selectedInputAssetsIds = selectedInputAssetsIdsString.split(",");
  const requestType = processingTypeToProcessingRequestType(processingType as ProcessingType);
  const shouldNotify = formData.get("shouldNotify") === "on";
  await createProcessingRequest(requestType, projectId, selectedInputAssetsIds, shouldNotify, user.token!);
  return { shouldResetSelectedAssets: true };
};

export default function ProcessingPage() {
  const { processingType, assets, processingRequests, projectId, user, flashMessage } = useLoaderData<typeof loader>();
  useFlashMessage(flashMessage);

  const [assets_, setAssets] = useState<Asset[]>(assets);

  useEffect(() => {
    document.addEventListener("assetsUpdated", () => {
      if (!user?.token) return;
      getAssetsForProjectOnClient(projectId, user.token).then((assets) => {
        setAssets(filterAssetsByType(assets, processingType as ProcessingType));
      });
    });
  }, [projectId, user?.token, processingType]);

  return (
    <main className="grow flex flex-col space-y-16 md:space-y-0 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)_minmax(0,3fr)] bg-slate-50">
      <ProcessingApp assets={assets_} processingType={processingType} processingRequests={processingRequests} />
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
      return assets.filter(
        (asset) =>
          asset.type === AssetType.EVENT_LOG ||
          asset.type === AssetType.PROCESS_MODEL ||
          asset.type === AssetType.SIMOD_CONFIGURATION
      );
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
