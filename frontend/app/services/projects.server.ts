import { http, projectsURL } from "~/services/shared.server";
import type { Project } from "./projects";

export async function listProjectsForUser(userId: string, token: string): Promise<Project[]> {
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

export async function getProject(projectId: string, token: string): Promise<Project> {
  const url = `${projectsURL}/${projectId}`;
  const response = await http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Project;
}
