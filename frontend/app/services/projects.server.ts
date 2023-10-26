import { projectsURL } from "~/services/backend_urls";
import axios from "axios";

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

export const http = axios.create();

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios client failed:", error);
    if (error.response.status === 401) {
      console.error("Unauthorized:", error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export async function listProjectsForUser(
  userId: string,
  token: string
): Promise<Project[]> {
  const response = await http.get(projectsURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      user_id: userId,
    },
  });
  return response.data as Project[];
}

export async function getProject(
  projectId: string,
  token: string
): Promise<Project> {
  const url = `${projectsURL}/${projectId}`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Project;
}
