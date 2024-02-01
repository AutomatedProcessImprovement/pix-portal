import type { ProcessingRequest, ProcessingRequestType } from "./processing_requests";
import { http, processingRequestsURL } from "./shared.server";

export async function getProcessingRequestsForProject(projectId: string, token: string) {
  const url = `${processingRequestsURL}/?project_id=${projectId}&with_output_assets=true`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as ProcessingRequest[];
}

export async function createProcessingRequest(
  type: ProcessingRequestType,
  projectId: string,
  inputAssetsIds: string[],
  shouldNotify: boolean,
  token: string
) {
  const url = `${processingRequestsURL}/`;
  const payload = {
    type: type,
    project_id: projectId,
    input_assets_ids: inputAssetsIds,
    should_notify: shouldNotify,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return (await response.json()) as ProcessingRequest;
}

export async function getProcessingRequest(processingRequestId: string, token: string) {
  const url = `${processingRequestsURL}/${processingRequestId}`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as ProcessingRequest;
}
