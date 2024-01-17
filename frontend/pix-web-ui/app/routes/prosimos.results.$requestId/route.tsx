import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { getAsset } from "~/services/assets.server";
import { FileType } from "~/services/files";
import { getProcessingRequest } from "~/services/processing_requests.server";
import { requireLoggedInUser } from "~/shared/guards.server";
import { IndividualTaskStatistics } from "./components/IndividualTaskStatistics";
import { ResourceUtilization } from "./components/ResourceUtilization";
import { ScenarioStatistics } from "./components/ScenarioStatistics";
import { parseCsvFile } from "./csvParser.server";
import type { IndividualTaskStatisticsItem, ResourceUtilizationItem, ScenarioStatisticsItem } from "./prosimosReport";

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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const requestId = params.requestId as string;

  const processingRequest = await getProcessingRequest(requestId, user.token!);
  if (processingRequest.output_assets_ids.length === 0) throw new Response("No output assets found", { status: 404 });

  const outputAsset = await getAsset(processingRequest.output_assets_ids[0], false, user.token!);
  const prosimosReportCsv = outputAsset.files?.find((file) => file.type === FileType.STATISTICS_PROSIMOS_CSV);
  if (!prosimosReportCsv) throw new Response("No Prosimos report found", { status: 404, statusText: "Not Found" });
  const report = await parseCsvFile(prosimosReportCsv.id, user.token!);
  return json({ report });
};

export default function ProsimosStatisticsPage() {
  const { report } = useLoaderData<typeof loader>();

  if (!report) throw new Error("No report found");
  return (
    <div className="flex flex-col p-8 items-center justify-center">
      <h1 className="text-3xl font-semibold">Simulation Statistics</h1>
      {report && <ScenarioStatistics data={report[2].data as ScenarioStatisticsItem[]} />}
      {report && <ResourceUtilization data={report[0].data as ResourceUtilizationItem[]} />}
      {report && <IndividualTaskStatistics data={report[1].data as IndividualTaskStatisticsItem[]} />}
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
            <span className="text-red-600">{error.statusText}</span>
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
