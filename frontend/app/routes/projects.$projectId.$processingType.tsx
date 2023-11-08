import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useMatches, useRouteError } from "@remix-run/react";
import InputAssets from "~/components/processing/InputAssets";
import ProcessingMenu from "~/components/processing/ProcessingMenu";
import { getAssetsForProject } from "~/services/assets.server";
import { requireLoggedInUser } from "~/session.server";
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
    const assets = await getAssetsForProject(projectId, user.token!);
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
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">
        <InputAssets assets={assets} processingType={processingType} />
      </div>
      <div className="border-l-2 border-t-2 border-b-2 border-red-400 bg-yellow-50">{processingType}</div>
      <div className="border-2 border-red-400 px-2 py-1 bg-yellow-50">Output assets</div>
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
