import { createContext } from "react";
import type { ILabeledAny } from "../shared";

export const SelectedAssetTypeContext = createContext<{
  assetType: ILabeledAny | undefined;
  assetTypes: ILabeledAny[];
} | null>(null);
