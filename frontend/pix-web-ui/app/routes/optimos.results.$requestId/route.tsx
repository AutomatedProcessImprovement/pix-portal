import { json, redirect, type LoaderFunctionArgs, type MetaFunction, TypedResponse } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import type { AxiosError } from "axios";
import { getAsset } from "~/services/assets.server";
import { getProcessingRequest } from "~/services/processing_requests.server";
import { requireLoggedInUser } from "~/shared/guards.server";
import OptimizationResults from "./components/OptimosResults";
import { JsonReport } from "~/shared/optimos_json_type";
import { FileType, getFileContent } from "~/services/files.server";
import Header from "~/components/Header";
import { UserContext } from "../contexts";
import ProjectNav from "../projects.$projectId/components/ProjectNav";
import { ProjectContext } from "../projects.$projectId/contexts";
import { User } from "~/services/auth";
import { getProject } from "~/services/projects.server";
import { Project } from "~/services/projects";
import { GlobalNav } from "~/components/GlobalNav";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Simulation Statistics —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    report: JsonReport | null;
    project?: Project;
    user?: User;
  }>
> => {
  const user = await requireLoggedInUser(request);
  const requestId = params.requestId as string;

  let processingRequest, outputAsset;
  try {
    processingRequest = await getProcessingRequest(requestId, user.token!);
    if (processingRequest?.output_assets_ids.length === 0) {
      throw new Response("No output assets found", { status: 404 });
    }
    outputAsset = await getAsset(processingRequest.output_assets_ids[0], false, user.token!);
  } catch (e: any) {
    const err = e as AxiosError;
    if (err.response?.status === 401) {
      throw redirect("/login");
    }
    const status = err.response?.status || 500;
    const message = (err.response?.data as string) || err.message || "Error";
    throw new Response(message, { status: status });
  }

  const optimosReportJsonFile = outputAsset.files?.find(
    (file) => file.type === FileType.OPTIMIZATION_REPORT_OPTIMOS_JSON
  );
  if (!optimosReportJsonFile) return json({ report: null });
  const fileContent = await getFileContent(optimosReportJsonFile.id, user.token!);
  const jsonStr = fileContent.toString();
  const report = JSON.parse(jsonStr);

  const projectId = processingRequest.project_id;

  const project = await getProject(projectId, user.token!);

  return json({ report, project, user });
};

export default function OptimosStatisticsPage() {
  const { report, user, project } = useLoaderData<typeof loader>();

  if (!report || !user) throw new Error("No report found");
  return (
    <div className="min-h-full flex flex-col justify-between">
      <div className="flex grow flex-col min-h-full">
        <Header userEmail={user.email} />

        {report && <OptimizationResults report={report} />}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="m-8 text-center">
          <p className="text-3xl">
            <span className="text-red-600">{error.statusText || "Error"}</span>
          </p>
          <p className="text-base mt-2">{error.data}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="m-8 text-center">
        <p className="text-3xl">
          <span className="text-red-600">Something went wrong</span>
        </p>
      </div>
    </div>
  );
}
