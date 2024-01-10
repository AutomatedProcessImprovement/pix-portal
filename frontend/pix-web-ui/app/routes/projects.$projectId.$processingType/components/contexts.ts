import { createContext } from "react";
import type { Asset } from "~/services/assets";
import type { BpmnData } from "./prosimos/bpmn";

export const SelectedAssetsContext = createContext<Asset[]>([]);
export const BpmnDataContext = createContext<BpmnData | null>(null);
export const AssetsContext = createContext<Asset[]>([]);
