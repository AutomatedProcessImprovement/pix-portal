import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer";
import Header from "~/components/Header";
import type { Project } from "~/services/projects";
import { getProject } from "~/services/projects.server";
import { handleNewAssets } from "~/shared/file_upload_handler.server";
import { requireLoggedInUser, requireProjectIdInParams } from "~/shared/guards.server";
import { EnabledProcessingTypes, ProcessingTypes } from "~/shared/processing_type";
import { getFlashMessage, sessionStorage } from "~/shared/session.server";
import { handleThrow } from "~/shared/utils";
import { useFlashMessage } from "../_index/route";
import { UserContext } from "../contexts";
import { ProcessingCard } from "./components/ProcessingCard";
import { ProcessingCardMini } from "./components/ProcessingCardMini";
import ProjectNav from "./components/ProjectNav";
import { ProjectContext } from "./contexts";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  const { project } = matches.find((match) => match.id === "routes/projects.$projectId")?.data as { project: Project };

  return [
    { title: `${project.name} —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) throw new Error("Project ID is required in the path");

  const user = await requireLoggedInUser(request);
  const [flashMessage, session] = await getFlashMessage(request);

  return handleThrow(request, async () => {
    const project = await getProject(projectId, user.token!);
    return json(
      { user, project, flashMessage },
      { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
    );
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const projectId = await requireProjectIdInParams(params);

  await handleThrow(request, async () => {
    return await handleNewAssets(request, projectId, user.token!);
  });

  return null;
}

export default function ProjectPage() {
  const { user, project, flashMessage } = useLoaderData<typeof loader>();
  useFlashMessage(flashMessage);

  const matches = useMatches();
  const [isProcessingPageActive, setIsProcessingPageActive] = useState(false);
  useEffect(() => {
    setIsProcessingPageActive(matches.some((match) => match.id === "routes/projects.$projectId.$processingType"));
  }, [matches]);

  const smSize = 12 / EnabledProcessingTypes.length;

  return (
    <div className="min-h-full flex flex-col justify-between">
      <div className="flex grow flex-col min-h-full">
        <Header userEmail={user.email} />
        <UserContext.Provider value={user}>
          <ProjectContext.Provider value={project}>
            <ProjectNav project={project} />
            {!isProcessingPageActive && (
              <div
                className={`p-6 grid lg:grid-cols-${smSize * 2} md:grid-cols-${
                  smSize * 2
                } sm:grid-cols-${smSize} gap-6`}
              >
                {EnabledProcessingTypes.map((processingType) => (
                  <ProcessingCard key={processingType} projectId={project.id} processingType={processingType} />
                ))}
              </div>
            )}
            {isProcessingPageActive && (
              <div className={`grid lg:grid-cols-${smSize * 2} md:grid-cols-${smSize * 2} sm:grid-cols-${smSize}`}>
                {EnabledProcessingTypes.map((processingType) => (
                  <ProcessingCardMini key={processingType} projectId={project.id} processingType={processingType} />
                ))}
              </div>
            )}
            <Outlet context={{ user, project }} />
          </ProjectContext.Provider>
        </UserContext.Provider>
      </div>
      <Footer />
    </div>
  );
}
