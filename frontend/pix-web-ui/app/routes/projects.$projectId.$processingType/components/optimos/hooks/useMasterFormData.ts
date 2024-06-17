import type { ConsParams, SimParams, ScenarioProperties } from "~/shared/optimos_json_type";
import useJsonFile from "./useJsonFile";
import { useYAMLFile } from "./useYAMLFile";
import { useFileFromAsset } from "./useFetchedAsset";
import { AssetType } from "~/services/assets";
import { FileType } from "~/services/files";
import { useMemo } from "react";
import { timetableSchema } from "../validation/timetableSchema";
import type { ValidationError } from "yup";
import { constraintsSchema } from "../validation/constraintsSchema";

export type MasterFormData = {
  constraints?: ConsParams;
  simulationParameters?: SimParams;
  scenarioProperties: ScenarioProperties;
};

const DEFAULT_CONFIG: ScenarioProperties = {
  scenario_name: "My first scenario",
  num_instances: 100,
  algorithm: "HC-FLEX",
  approach: "CO",
};

export const useMasterFormData = () => {
  const [simParamsFile] = useFileFromAsset(AssetType.SIMULATION_MODEL, FileType.SIMULATION_MODEL_PROSIMOS_JSON);
  const [consParamsFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON);
  const [configFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.CONFIGURATION_OPTIMOS_YAML);

  const { jsonData: consParamsJson } = useJsonFile<ConsParams>(consParamsFile || null);
  const { jsonData: simParamsJson } = useJsonFile<SimParams>(simParamsFile || null);
  const { yamlData: scenarioJson } = useYAMLFile<ScenarioProperties>(configFile || null);

  const masterFormData = useMemo<MasterFormData>(
    () => ({
      constraints: consParamsJson,
      simulationParameters: simParamsJson,
      scenarioProperties: scenarioJson || DEFAULT_CONFIG,
    }),
    [consParamsJson, simParamsJson, scenarioJson]
  );

  const hasSimParamsFile = simParamsFile !== null;
  const hasConsParamsFile = consParamsFile !== null;
  const hasConfigFile = configFile !== null;

  const simParamsError = useMemo<ValidationError | null>(() => {
    try {
      if (simParamsJson) {
        timetableSchema.validateSync(simParamsJson);
      }
    } catch (e) {
      debugger;
      return e as ValidationError;
    }
    return null;
  }, [simParamsJson]);

  const constraintsError = useMemo<ValidationError | null>(() => {
    try {
      if (consParamsJson) {
        constraintsSchema.validateSync(consParamsJson);
      }
    } catch (e) {
      return e as ValidationError;
    }
    return null;
  }, [consParamsJson]);

  return [
    masterFormData,
    hasSimParamsFile,
    hasConsParamsFile,
    hasConfigFile,
    simParamsError,
    constraintsError,
  ] as const;
};
