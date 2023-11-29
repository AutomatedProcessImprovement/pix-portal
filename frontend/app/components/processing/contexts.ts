import { createContext } from "react";
import type { Asset } from "~/services/assets";
import type { User } from "~/services/auth";
import type { Project } from "~/services/projects";
import type { ILabeledAny } from "../shared";
import type { BpmnData } from "./prosimos/bpmn";

export const SelectedAssetsContext = createContext<Asset[]>([]);
export const UserContext = createContext<User | null>(null);
export const BpmnDataContext = createContext<BpmnData | null>(null);
export const SelectedAssetTypeContext = createContext<{
  assetType: ILabeledAny | undefined;
  assetTypes: ILabeledAny[];
} | null>(null);
export const ProjectContext = createContext<Project | null>(null);
export const ProjectsContext = createContext<Project[]>([]);
