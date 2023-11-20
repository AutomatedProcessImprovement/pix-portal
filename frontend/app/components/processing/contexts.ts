import { createContext } from "react";
import { Asset } from "~/services/assets";
import { User } from "~/services/auth";
import { BpmnData } from "./prosimos/bpmn";

export const SelectedAssetsContext = createContext<Asset[]>([]);
export const UserContext = createContext<User | null>(null);
export const BpmnDataContext = createContext<BpmnData | null>(null);
