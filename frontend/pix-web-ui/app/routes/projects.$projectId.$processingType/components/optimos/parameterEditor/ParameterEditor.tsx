import type { AlertColor } from "@mui/material";
import YAML from "yaml";
import { Badge, Button, Grid, Stack, Step, StepButton, StepIcon, Stepper, Tooltip, useTheme } from "@mui/material";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Groups as GroupsIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

import useFormState from "./useFormState";
import useJsonFile from "./useJsonFile";
import { TABS, TabNames, getIndexOfTab } from "./useTabVisibility";
import GlobalConstraints from "../constraintEditors/GlobalConstraints";
import { FormProvider, useForm } from "react-hook-form";
import ResourceConstraints from "../resourceConstraints/ResourceConstraints";
import ScenarioConstraints from "../constraintEditors/ScenarioConstraints";
import { UserContext } from "~/routes/contexts";
import { AssetType, createAsset, patchAsset } from "~/services/assets";
import { useFileFromAsset } from "./useFetchedAsset";
import { FileType, deleteFile, getFile, uploadFile } from "~/services/files";
import { useMatches, useSearchParams } from "@remix-run/react";
import {
  useSelectAsset,
  useSelectedInputAsset,
} from "~/routes/projects.$projectId.$processingType/components/useSelectedInputAsset";
import { ProcessingAppSection } from "~/routes/projects.$projectId.$processingType/components/ProcessingAppSection";
import { generateConstraints } from "../generateContraints";
import { SelectedAssetsContext, SetSelectedAssetsContext } from "~/routes/projects.$projectId.$processingType/contexts";
import { useOptimosTab } from "~/routes/projects.$projectId.$processingType/hooks/useOptimosTab";
import { ConsParams, ScenarioProperties, SimParams } from "~/shared/optimos_json_type";
import { ValidationTab } from "../validation/ValidationTab";
import { SimParamFormProvider } from "~/routes/projects.$projectId.$processingType/hooks/useSimParamsForm";

const tooltip_desc: Record<string, string> = {
  GLOBAL_CONSTRAINTS: "Define the algorithm, approach and number of iterations",
  SCENARIO_CONSTRAINTS: "Define the top-level restrictions like the time granularity and the maximum work units",
  RESOURCE_CONSTRAINTS: "Define resource specific constraints, their maximum capacity and working masks",
  SIMULATION_RESULTS: "",
};

const SetupOptimos = () => {
  const theme = useTheme();
  const activeColor = theme.palette.info.dark;
  const successColor = theme.palette.success.light;
  const errorColor = theme.palette.error.light;
  const selectAsset = useSelectAsset();
  const selectedAssets = useContext(SelectedAssetsContext);

  const user = useContext(UserContext);
  const projectId = useMatches().filter((match) => match.id === "routes/projects.$projectId")[0].params.projectId;
  const [optimosConfigAsset, setOptimosConfigAsset] = useSelectedInputAsset(AssetType.OPTIMOS_CONFIGURATION);
  const [simulationConfigAsset, setSimulationConfigAsset] = useSelectedInputAsset(AssetType.SIMULATION_MODEL);

  const [activeStep, setActiveStep] = useOptimosTab();

  const [isScenarioParamsValid, setIsScenarioParamsValid] = useState(true);

  //   const { bpmnFile, simParamsFile, consParamsFile } = state as LocationState
  const [bpmnFile] = useFileFromAsset(AssetType.SIMULATION_MODEL, FileType.PROCESS_MODEL_BPMN);
  const [simParamsFile] = useFileFromAsset(AssetType.SIMULATION_MODEL, FileType.SIMULATION_MODEL_PROSIMOS_JSON);
  const [consParamsFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON);
  const [configFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.CONFIGURATION_OPTIMOS_YAML);

  const { jsonData: consParamsJson } = useJsonFile<ConsParams>(consParamsFile || null);
  const { jsonData: simParamsJson } = useJsonFile<SimParams>(simParamsFile || null);

  const constraintsForm = useForm<ConsParams>({ values: consParamsJson });
  const { formState, getValues: getConstraintValues, setValue: setConstraintValue } = constraintsForm;
  const { isSubmitted, errors, submitCount } = formState;

  const simParamsForm = useForm<SimParams>({ values: simParamsJson });

  const scenarioForm = useForm<ScenarioProperties>({
    mode: "onBlur",
    defaultValues: {
      scenario_name: "My first scenario",
      num_iterations: 100,
      algorithm: "HC-FLEX",
      approach: "CO",
    },
    // TODO Form validation
    // resolver: yupResolver(prosimosConfigurationSchema),
    shouldUseNativeValidation: true,
  });
  const {
    getValues: getScenarioValues,
    formState: { errors: scenarioErrors },
    setValue: setScenarioValue,
  } = scenarioForm;

  useEffect(() => {
    if (configFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          const config = YAML.parse(content as string);
          setScenarioValue("scenario_name", config.scenario_name);
          setScenarioValue("num_iterations", config.num_instances);
          setScenarioValue("algorithm", config.algorithm);
          setScenarioValue("approach", config.approach);
        }
      };
      reader.readAsText(configFile);
    }
  }, [configFile, setScenarioValue]);

  // validate both forms: scenario params and json fields
  useEffect(() => {
    // isValid doesn't work properly on init
    const isJsonParamsValid = Object.keys(errors)?.length === 0;

    if (!isScenarioParamsValid || !isJsonParamsValid) {
      console.log(errors);
      setErrorMessage("There are validation errors");
    }
  }, [errors, isScenarioParamsValid, isSubmitted, submitCount]);

  const setErrorMessage = (value: string) => {
    // TODO Error Handling
  };

  const getStepContent = (index: TABS) => {
    switch (index) {
      case TABS.GLOBAL_CONSTRAINTS:
        return (
          <GlobalConstraints
            scenarioFormState={scenarioForm}
            jsonFormState={constraintsForm}
            setErrorMessage={setErrorMessage}
          />
        );
      case TABS.SCENARIO_CONSTRAINTS:
        return (
          <ScenarioConstraints
            scenarioFormState={scenarioForm}
            jsonFormState={constraintsForm}
            setErrorMessage={setErrorMessage}
          />
        );
      case TABS.RESOURCE_CONSTRAINTS:
        return <ResourceConstraints setErrorMessage={setErrorMessage} constraintsForm={constraintsForm} />;
      case TABS.VALIDATION_RESULTS:
        return <ValidationTab constraintsForm={constraintsForm} />;
    }
  };

  const getBadgeContent = (areAnyErrors: boolean) => {
    let BadgeIcon: typeof CancelIcon | typeof CheckCircleIcon, color: string;
    if (areAnyErrors) {
      BadgeIcon = CancelIcon;
      color = errorColor;
    } else {
      BadgeIcon = CheckCircleIcon;
      color = successColor;
    }

    return <BadgeIcon style={{ marginRight: "-9px", color }} />;
  };
  const getStepIcon = (currentTab: TABS): React.ReactNode => {
    const isActiveStep = activeStep === currentTab;
    const styles = isActiveStep ? { color: activeColor } : {};

    let currError: any;

    switch (currentTab) {
      case TABS.GLOBAL_CONSTRAINTS:
        currError = scenarioErrors;
        return <BuildIcon style={styles} />;

      case TABS.SCENARIO_CONSTRAINTS:
        return <SettingsIcon style={styles} />;

      case TABS.RESOURCE_CONSTRAINTS:
        currError = errors.hours_in_day;
        return <GroupsIcon style={styles} />;

      case TABS.VALIDATION_RESULTS:
        const areAnyErrors = currError && (currError.length > 0 || Object.keys(currError)?.length > 0);
        return (
          <Badge badgeContent={getBadgeContent(areAnyErrors)} overlap="circular">
            <WarningIcon style={styles} />
          </Badge>
        );

      default:
        return <></>;
    }
  };

  const fromContentToBlob = (values: any) => {
    const content = JSON.stringify(values);
    const blob = new Blob([content], { type: "text/plain" });
    return blob;
  };

  const getConstraintsConfigBlob = useCallback((): Blob => {
    const values = getConstraintValues();
    const blob = fromContentToBlob(values);

    return blob;
  }, [getConstraintValues]);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!(bpmnFile || simParamsFile) && searchParams.get("tabIndex") !== null) {
      setSearchParams({ tabIndex: "" });
    }
  }, [bpmnFile, simParamsFile, searchParams, setSearchParams]);

  const handleConfigSave = useCallback(
    // save form data as configuration file, create or update the asset, and update the selected asset IDs
    async () => {
      if (!optimosConfigAsset) return;
      const { num_iterations, approach, algorithm, scenario_name } = getScenarioValues();

      const globalConfig = {
        scenario_name: scenario_name,
        num_instances: num_iterations,
        algorithm: algorithm,
        approach: approach,
      };

      const token = user!.token!;

      const constraints = getConstraintsConfigBlob();
      const constraintsConfigFile = await uploadFile(
        constraints,
        `${uuidv4()}.json`,
        FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON,
        token
      );

      const globalConfigBlob = new Blob([YAML.stringify(globalConfig)], { type: "text/yaml" });
      const globalConfigFile = await uploadFile(
        globalConfigBlob,
        `${uuidv4()}.yaml`,
        FileType.CONFIGURATION_OPTIMOS_YAML,
        token
      );

      const files = await Promise.all(optimosConfigAsset.files_ids.map((id) => getFile(id, token)));
      const outdatedFiles = files.filter(
        (file) =>
          file.type === FileType.CONFIGURATION_OPTIMOS_YAML || file.type === FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON
      );

      const preservedFiles = files.filter((file) => !outdatedFiles.includes(file));

      const newFileIds = [globalConfigFile.id, constraintsConfigFile.id, ...preservedFiles.map((file) => file.id)];

      // update existing asset
      const updatedAsset = await patchAsset({ files_ids: newFileIds }, optimosConfigAsset.id, token);
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
      setOptimosConfigAsset(updatedAsset);
      toast.success("Optimos configuration updated", { duration: 5000 });
    },
    [optimosConfigAsset, getScenarioValues, user, getConstraintsConfigBlob, setOptimosConfigAsset]
  );
  const createConstraintsFromSimParams = async () => {
    if (optimosConfigAsset || !projectId || !simParamsJson) return;
    const constraints = generateConstraints(simParamsJson);

    const token = user!.token!;
    const constraintsConfigFile = await uploadFile(
      new Blob([JSON.stringify(constraints, null, 2)]),
      `${uuidv4()}.json`,
      FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON,
      token
    );
    const fileIds = [constraintsConfigFile.id];
    const asset = await createAsset(
      fileIds,
      "generated_constraints",
      AssetType.OPTIMOS_CONFIGURATION,
      projectId,
      token
    );
    document.dispatchEvent(new Event("assetsUpdated"));
    selectAsset(asset);
  };

  return (
    <SimParamFormProvider value={simParamsForm}>
      <ProcessingAppSection heading="Optimization Configuration">
        {!(bpmnFile || simParamsFile) && (
          <p className="my-4 py-2 prose prose-md prose-slate max-w-lg text-center">
            Select a Optimos Configuration and Simulation Model from the input assets on the left.
          </p>
        )}
        {bpmnFile && simParamsFile && !consParamsFile && (
          <p className="my-4 py-2 prose prose-md prose-slate max-w-lg text-center">
            You have only selected a Simulation Model, please select a Optimos Configuration file or click "Generate
            Constraints" below.
            <Button variant="contained" color="primary" onClick={createConstraintsFromSimParams}>
              Generate Constraints
            </Button>
          </p>
        )}

        {bpmnFile && simParamsFile && consParamsFile && (
          <FormProvider {...scenarioForm}>
            <form
              method="POST"
              onSubmit={scenarioForm.handleSubmit(async (e, t) => {
                await handleConfigSave();
                t?.target.submit();
              })}
            >
              <input
                type="hidden"
                name="selectedInputAssetsIds"
                value={selectedAssets.map((asset) => asset.id).join(",")}
              />
              <input type="hidden" name="shouldNotify" value="off" />
              <input type="hidden" name="projectId" value={projectId} />

              <Grid container alignItems="center" justifyContent="center">
                <Grid item xs={12} sx={{ paddingTop: "10px" }}>
                  <Grid item container xs={12} alignItems="center" justifyContent="center" sx={{ paddingTop: "20px" }}>
                    <Stepper nonLinear alternativeLabel activeStep={getIndexOfTab(activeStep)} connector={<></>}>
                      {Object.entries(TabNames).map(([key, label]) => {
                        const keyTab = key as keyof typeof TABS;
                        const valueTab: TABS = TABS[keyTab];

                        return (
                          <Step key={label}>
                            <Tooltip title={tooltip_desc[key]}>
                              <StepButton
                                color="inherit"
                                onClick={() => {
                                  setActiveStep(valueTab);
                                }}
                                icon={getStepIcon(valueTab)}
                              >
                                {label}
                              </StepButton>
                            </Tooltip>
                          </Step>
                        );
                      })}
                    </Stepper>
                    <Grid container mt={3} style={{ marginBottom: "2%" }}>
                      {getStepContent(activeStep)}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container item xs={12} alignItems="center" justifyContent="center" textAlign={"center"}>
                  <Grid item container justifyContent="center">
                    <Stack direction="row" spacing={2}>
                      <Button onClick={handleConfigSave} variant="outlined" color="primary" sx={{ marginTop: "20px" }}>
                        Save Config
                      </Button>
                      <Button type="submit" variant="contained" color="primary" sx={{ marginTop: "20px" }}>
                        Start Optimization
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        )}
      </ProcessingAppSection>
    </SimParamFormProvider>
  );
};
export default SetupOptimos;
