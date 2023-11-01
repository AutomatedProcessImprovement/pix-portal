import { getProject } from "~/services/projects.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { safeFetch } from "~/utils";
import { requireLoggedInUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import Header from "~/components/Header";
import ProjectNav from "~/components/ProjectNav";
import UploadAssetDialog from "~/components/UploadAssetDialog";

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

        <UploadAssetDialog trigger={<button>Upload asset</button>} />
      </>
    );
  }

  return (
    <>
      <h1>Project not found</h1>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);

  // handling new asset upload
  const formData = await request.formData();
  const errors = await validateNewAssetData(formData);

  if (errors.length > 0) {
    return json({ errors, user });
  }

  const eventLog = formData.get("eventLogFile");
  const processModel = formData.get("processModelFile");
  const simulationModel = formData.get("simulationModelFile");
  console.log("eventLog", eventLog);
  console.log("processModel", processModel);
  console.log("simulationModel", simulationModel);

  return json({ user });
}

async function validateNewAssetData(formData: FormData) {
  const errors: string[] = [];

  // TODO: validate file type

  return errors;
}
