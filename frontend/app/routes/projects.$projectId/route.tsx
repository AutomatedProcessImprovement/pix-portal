import { ClockIcon, Cog8ToothIcon, MapIcon } from "@heroicons/react/20/solid";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { useEffect, useState } from "react";
import Header from "~/components/Header";
import { UserContext } from "~/routes/projects.$projectId.$processingType/components/contexts";
import { getProject } from "~/services/projects.server";
import {
  ProcessingType,
  ProcessingTypes,
  processingTypeDescription,
  processingTypeToLabel,
} from "~/shared/processing_type";
import { requireLoggedInUser } from "~/shared/session.server";
import { handleThrow } from "~/shared/utils";
import ProjectNav from "./ProjectNav";
import { ProjectContext } from "./contexts";
import { createAssetsFromForm } from "./file_upload.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    return redirect("/projects");
  }

  const user = await requireLoggedInUser(request);

  return handleThrow(request, async () => {
    const project = await getProject(projectId, user.token!);
    return json({ user, project });
  });
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

export default function ProjectPage() {
  const { user, project } = useLoaderData<typeof loader>();

  const matches = useMatches();
  const [isProcessingPageActive, setIsProcessingPageActive] = useState(false);
  useEffect(() => {
    setIsProcessingPageActive(matches.some((match) => match.id === "routes/projects.$projectId.$processingType"));
  }, [matches]);

  return (
    <>
      <Header userEmail={user.email} />
      <UserContext.Provider value={user}>
        <ProjectContext.Provider value={project}>
          <ProjectNav project={project} />
          {!isProcessingPageActive && (
            <div className="p-6 grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 gap-6">
              {ProcessingTypes.map((processingType) => (
                <ProcessingCard key={processingType} projectId={project.id} processingType={processingType} />
              ))}
            </div>
          )}
          {isProcessingPageActive && (
            <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2">
              {ProcessingTypes.map((processingType) => (
                <ProcessingCardMini key={processingType} projectId={project.id} processingType={processingType} />
              ))}
            </div>
          )}
          <Outlet context={{ user, project }} />
        </ProjectContext.Provider>
      </UserContext.Provider>
    </>
  );
}

function ProcessingCard({ projectId, processingType }: { projectId: string; processingType: ProcessingType }) {
  function navLinkClasses({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
    let classes =
      "border-none flex flex-col bg-slate-50 border border-slate-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-slate-100";
    if (isPending) classes += " text-red-600 animate-pulse";
    if (isActive) classes += " bg-slate-200 hover:bg-slate-200";
    return classes;
  }

  return (
    <NavLink to={`/projects/${projectId}/${processingType}`} className={navLinkClasses}>
      {({ isActive, isPending }) => (
        <div className="flex flex-grow flex-col justify-start p-4 space-y-2 leading-normal text-slate-900">
          <h5 className="text-xl font-bold tracking-tight text-slate-900">{processingTypeToLabel(processingType)}</h5>
          <p>{processingTypeDescription(processingType)}</p>
        </div>
      )}
    </NavLink>
  );
}

function ProcessingCardMini({ projectId, processingType }: { projectId: string; processingType: ProcessingType }) {
  function navLinkClasses({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
    let classes =
      "group/card border-none flex flex-col hover:bg-slate-100 border border-slate-200 md:flex-row md:max-w-xl";
    if (isPending) classes += " bg-white text-red-600 animate-pulse";
    if (isActive) classes += " bg-slate-100";
    return classes;
  }

  const description = processingTypeDescription(processingType);

  return (
    <NavLink to={`/projects/${projectId}/${processingType}`} className={navLinkClasses} title={description}>
      {({ isActive, isPending }) => (
        <div className="border-r border-slate-200 flex flex-grow justify-between items-center py-2 px-6 leading-normal h-14">
          <h5
            className={`text-lg font-semibold tracking-normal ${
              isActive ? "text-slate-700" : "text-slate-400 group-hover/card:text-slate-500"
            }`}
          >
            {processingTypeToLabel(processingType)}
          </h5>
          <div
            className={`rounded-full h-9 w-9 flex place-content-center ${
              isActive ? "text-slate-300 bg-white" : "text-slate-300 bg-slate-100 group-hover/card:bg-white"
            }`}
          >
            {iconForProcessingType(processingType)}
          </div>
        </div>
      )}
    </NavLink>
  );
}

function iconForProcessingType(processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return <MapIcon className="w-5" />;
    case ProcessingType.Simulation:
      return <Cog8ToothIcon className="w-5" />;
    case ProcessingType.WaitingTime:
      return <ClockIcon className="w-5" />;
  }
}
