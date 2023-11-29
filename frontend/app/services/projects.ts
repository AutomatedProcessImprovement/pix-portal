import { clientSideHttp } from "./shared";

export interface Project {
  id: string;
  name: string;
  description?: string;
  creation_time: string;
  modification_time?: string;
  deletion_time?: string;
  users_ids: string[];
  assets_ids: string[];
  processing_requests_ids: string[];
}

export async function listProjectsForUser(userId: string, token: string): Promise<Project[]> {
  const url = `/projects/`;
  const response = await clientSideHttp.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      user_id: userId,
    },
  });
  return response.data as Project[];
}
