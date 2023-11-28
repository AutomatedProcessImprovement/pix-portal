import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import ProjectNav from "~/components/ProjectNav";
import { getProject } from "~/services/projects.server";
import { requireLoggedInUser } from "~/session.server";
import { createAssetsFromForm } from "~/shared/file_upload.server";
import { handleThrow } from "~/utils";

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

export default function ProjectPage() {
  const { user, project } = useLoaderData<typeof loader>();

  return (
    <>
      <Header userEmail={user.email} />
      <ProjectNav project={project} />
      <Outlet />
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
