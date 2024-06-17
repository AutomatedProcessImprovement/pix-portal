import YAML from "yaml";
import toast from "react-hot-toast";
import type { File as PixFile } from "~/services/files";
import { useCallback, useContext } from "react";
import type { UseFormReturn } from "react-hook-form";
import { UserContext } from "~/routes/contexts";
import type { MasterFormData } from "./useMasterFormData";
import { FileType, deleteFile, getFile, uploadFile } from "~/services/files";
import { v4 as uuidv4 } from "uuid";
import { useSelectedInputAsset } from "../../useSelectedInputAsset";
import type { Asset } from "~/services/assets";
import { AssetType, patchAsset } from "~/services/assets";
import type { User } from "~/services/auth";

export const useOptimosConfigSave = (form: UseFormReturn<MasterFormData>) => {
  const { getValues } = form;
  const user = useContext(UserContext);
  const [optimosConfigAsset, setOptimosConfigAsset] = useSelectedInputAsset(AssetType.OPTIMOS_CONFIGURATION);
  const saveConfig = useCallback(
    // save form data as configuration file, create or update the asset, and update the selected asset IDs
    async () => {
      if (!optimosConfigAsset) return;
      const { scenarioProperties, constraints } = getValues();

      const token = user!.token!;

      const constraintsConfigFile = await uploadFile(
        new Blob([JSON.stringify(constraints)], { type: "application/json" }),
        `${uuidv4()}.json`,
        FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON,
        token
      );

      const globalConfigBlob = new Blob([YAML.stringify(scenarioProperties)], { type: "text/yaml" });
      const globalConfigFile = await uploadFile(
        globalConfigBlob,
        `${uuidv4()}.yaml`,
        FileType.CONFIGURATION_OPTIMOS_YAML,
        token
      );
      const newFiles = [globalConfigFile, constraintsConfigFile];
      const updatedAsset = await updateAssetWithNewFiles(optimosConfigAsset, newFiles, user!);
      if (updatedAsset) {
        toast.success("Optimos configuration updated", { duration: 5000 });
        setOptimosConfigAsset(updatedAsset);
      }
    },
    [getValues, optimosConfigAsset, setOptimosConfigAsset, user]
  );
  return saveConfig;
};

export const useSimulationParametersSave = (form: UseFormReturn<MasterFormData>) => {
  const { getValues } = form;
  const user = useContext(UserContext);
  const [simulationAsset, setSimulationAsset] = useSelectedInputAsset(AssetType.SIMULATION_MODEL);
  const saveConfig = useCallback(
    // save form data as configuration file, create or update the asset, and update the selected asset IDs
    async () => {
      if (!simulationAsset) return;
      const { simulationParameters } = getValues();

      const token = user!.token!;

      const simParamsFile = await uploadFile(
        new Blob([JSON.stringify(simulationParameters)], { type: "application/json" }),
        `${uuidv4()}.json`,
        FileType.SIMULATION_MODEL_PROSIMOS_JSON,
        token
      );

      const newFiles = [simParamsFile];
      const updatedAsset = await updateAssetWithNewFiles(simulationAsset, newFiles, user!);
      if (updatedAsset) {
        toast.success("Simulation Timetable updated", { duration: 5000 });
        setSimulationAsset(updatedAsset);
      }
    },
    [simulationAsset, getValues, user, setSimulationAsset]
  );
  return saveConfig;
};

const updateAssetWithNewFiles = async (asset: Asset, newFiles: PixFile[], user: User) => {
  const token = user!.token!;
  const files = await Promise.all(asset.files_ids.map((id) => getFile(id, token)));
  const updatedFileTypes = newFiles.map((file) => file.type);
  const outdatedFiles = files.filter((file) => updatedFileTypes.includes(file.type));
  const preservedFiles = files.filter((file) => !outdatedFiles.includes(file));

  const newFileIds = [...newFiles.map((file) => file.id), ...preservedFiles.map((file) => file.id)];

  // update existing asset
  const updatedAsset = await patchAsset({ files_ids: newFileIds }, asset.id, token);
  if (updatedAsset) {
    // remove the old file if all is successful
    try {
      for (const file of outdatedFiles) {
        await deleteFile(file.id, token);
      }
    } catch (e) {
      console.error("error deleting old file", e);
      // don't throw, still continue with the update below because the asset was updated
    }
  }

  return updatedAsset;
};
