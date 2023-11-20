import { createContext } from "react";
import { Asset } from "~/services/assets";

export const SelectedAssetsContext = createContext<Asset[]>([]);
