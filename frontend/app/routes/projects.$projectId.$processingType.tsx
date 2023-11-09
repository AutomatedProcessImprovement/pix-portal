import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useMatches, useRouteError } from "@remix-run/react";
import ProcessingApp from "~/components/processing/ProcessingApp";
import ProcessingMenu from "~/components/processing/ProcessingMenu";
import { Asset, getAssetsForProject } from "~/services/assets.server";
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
    return json({ assets, processingType });
  });
};

function ensureProcessingTypeValidOrRedirect(processingType: string, projectId: string) {
  if (!Object.values(ProcessingType).includes(processingType as ProcessingType)) {
    throw redirect(`/projects/${projectId}`);
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function RouteComponent() {
  const matches = useMatches();
  const parentData = matches.filter((m) => m.id === "routes/projects.$projectId").map((m) => m.data)[0];
  const { project } = parentData as any;

  const { processingType, assets } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-[1fr_2fr_8fr_2fr]">
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <ProcessingMenu projectId={project.id} />
      </div>
      <ProcessingApp assets={assets} processingType={processingType} />
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
