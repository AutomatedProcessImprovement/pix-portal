import { ProcessingRequest, ProcessingRequestType } from "./processing_requests";
import { http, processingRequestsURL } from "./shared.server";

export async function getProcessingRequestsForProject(projectId: string, token: string) {
  const url = `${processingRequestsURL}/?project_id=${projectId}`;
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
  const response = await http.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as ProcessingRequest;
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
