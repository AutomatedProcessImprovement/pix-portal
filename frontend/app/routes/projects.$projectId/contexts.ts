import { createContext } from "react";
import type { Project } from "~/services/projects";

export const ProjectContext = createContext<Project | null>(null);
