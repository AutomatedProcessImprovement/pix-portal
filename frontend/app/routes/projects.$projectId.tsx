import { getProject } from "~/services/projects.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { safeFetch } from "~/utils";
import { requireLoggedInUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import Header from "~/components/Header";
import ProjectNav from "~/components/ProjectNav";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    return json({ project: null });
  }

  const user = await requireLoggedInUser(request);

  return safeFetch(request, async () => {
    const project = await getProject(projectId, user.token!);
    return json({ user, project });
  });
}

export default function ProjectPage() {
  const { user, project } = useLoaderData<typeof loader>();

  if (project) {
    return (
      <>
        <Header userEmail={user.email} />
        <ProjectNav project={project} />
        <h1>Project: {project.name}</h1>
      </>
    );
  }

  return (
    <>
      <h1>Project not found</h1>
    </>
  );
}
