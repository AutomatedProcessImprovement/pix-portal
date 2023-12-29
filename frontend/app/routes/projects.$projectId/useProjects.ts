import { useEffect, useState } from "react";
import type { User } from "~/services/auth";
import { listProjectsForUser } from "~/services/projects";
import type { ILabeledAny } from "~/components/shared";

export function useProjects(user: User | null) {
  const [projects, setProjects] = useState<ILabeledAny[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async (user: User) => {
      const projects = await listProjectsForUser(user.id, user.token!);
      const projectsLabeled = projects.map((project) => ({
        label: project.name,
        value: project,
      }));
      return projectsLabeled;
    };

    fetchProjects(user).then(setProjects);
  }, [user]);

  return projects;
}
