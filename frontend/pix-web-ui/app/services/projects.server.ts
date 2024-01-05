import { projectsURL } from "~/services/shared.server";
import type { Project } from "./projects";

export async function listProjectsForUser(userId: string, token: string): Promise<Project[]> {
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${projectsURL}/?${params}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if ("message" in data) throw new Error(data.message);
  return data as Project[];
}

export async function getProject(projectId: string, token: string): Promise<Project> {
  const response = await fetch(`${projectsURL}/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if ("message" in data) throw new Error(data.message);
  return data as Project;
}
