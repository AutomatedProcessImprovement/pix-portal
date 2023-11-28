import { createContext } from "react";
import type { Asset } from "~/services/assets";
import type { User } from "~/services/auth";
import type { BpmnData } from "./prosimos/bpmn";

export const SelectedAssetsContext = createContext<Asset[]>([]);
export const UserContext = createContext<User | null>(null);
export const BpmnDataContext = createContext<BpmnData | null>(null);
