import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import ProjectNav from "~/components/ProjectNav";
import { Asset, getAssetsForProject } from "~/services/assets.server";
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
    const assets = await getAssetsForProject(projectId, user.token!);
    return json({ user, project, assets });
  });
}

export default function ProjectPage() {
  const { user, project, assets } = useLoaderData<typeof loader>();

  return (
    <>
      <Header userEmail={user.email} />
      <ProjectNav project={project} />
      <section className="p-4 flex flex-col space-y-8">
        <section className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold">Assets</h2>
          <div className="max-w-fit overflow-scroll border-4 border-blue-100">
            <table className="">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Creation time</th>
                  <th>Files</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset: Asset) => (
                  <tr key={asset.id}>
                    <td className="truncate px-1">{asset.name}</td>
                    <td className="truncate px-1">{asset.type}</td>
                    <td className="truncate px-1">{asset.creation_time}</td>
                    <td className="truncate px-1">{asset.files_ids.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
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
