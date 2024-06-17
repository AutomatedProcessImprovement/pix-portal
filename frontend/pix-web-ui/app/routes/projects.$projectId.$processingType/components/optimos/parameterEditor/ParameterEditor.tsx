import YAML from "yaml";
import { Button, Grid, Stack, Step, StepButton, Stepper, Tooltip } from "@mui/material";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useCallback, useContext } from "react";

import { TABS, TabNames, getIndexOfTab } from "../hooks/useTabVisibility";
import GlobalConstraints from "../constraintEditors/GlobalConstraints";
import { FormProvider, useForm } from "react-hook-form";
import ResourceConstraints from "../resourceConstraints/ResourceConstraints";
import ScenarioConstraints from "../constraintEditors/ScenarioConstraints";
import { UserContext } from "~/routes/contexts";
import { AssetType, createAsset, patchAsset } from "~/services/assets";
import { useFileFromAsset } from "../hooks/useFetchedAsset";
import { FileType, deleteFile, getFile, uploadFile } from "~/services/files";
import { useMatches, useSearchParams } from "@remix-run/react";
import {
  useSelectAsset,
  useSelectedInputAsset,
} from "~/routes/projects.$projectId.$processingType/components/useSelectedInputAsset";
import { ProcessingAppSection } from "~/routes/projects.$projectId.$processingType/components/ProcessingAppSection";
import { generateConstraints } from "../generateContraints";
import { SelectedAssetsContext } from "~/routes/projects.$projectId.$processingType/contexts";
import { useOptimosTab } from "~/routes/projects.$projectId.$processingType/components/optimos/hooks/useOptimosTab";
import { ValidationTab } from "../validation/ValidationTab";
import { MasterFormData, useMasterFormData } from "../hooks/useMasterFormData";
import { CustomStepIcon } from "./CustomStepIcon";
import { constraintResolver } from "../validation/validationFunctions";
import { useOptimosConfigSave, useSimulationParametersSave } from "../hooks/useConfigSave";

const tooltip_desc: Record<string, string> = {
  GLOBAL_CONSTRAINTS: "Define the algorithm, approach and number of iterations",
  SCENARIO_CONSTRAINTS: "Define the top-level restrictions like the time granularity and the maximum work units",
  RESOURCE_CONSTRAINTS: "Define resource specific constraints, their maximum capacity and working masks",
  SIMULATION_RESULTS: "",
};

const SetupOptimos = () => {
  const selectAsset = useSelectAsset();
  const selectedAssets = useContext(SelectedAssetsContext);

  const user = useContext(UserContext);
  const projectId = useMatches().filter((match) => match.id === "routes/projects.$projectId")[0].params.projectId;
  const [optimosConfigAsset, setOptimosConfigAsset] = useSelectedInputAsset(AssetType.OPTIMOS_CONFIGURATION);

  const [activeStep, setActiveStep] = useOptimosTab();

  //   const { bpmnFile, simParamsFile, consParamsFile } = state as LocationState
  const [bpmnFile] = useFileFromAsset(AssetType.SIMULATION_MODEL, FileType.PROCESS_MODEL_BPMN);

  const [masterFormData, hasSimParamsFile, hasConsParamsFile, hasConfigFile] = useMasterFormData();

  const masterForm = useForm<MasterFormData>({
    values: masterFormData,
    mode: "onChange",
    resolver: constraintResolver,
  });
  const { getValues, trigger } = masterForm;

  useEffect(() => {
    trigger();
  }, [trigger, masterFormData]);

  const getStepContent = (index: TABS) => {
    switch (index) {
      case TABS.GLOBAL_CONSTRAINTS:
        return <GlobalConstraints />;
      case TABS.SCENARIO_CONSTRAINTS:
        return <ScenarioConstraints />;
      case TABS.RESOURCE_CONSTRAINTS:
        return <ResourceConstraints />;
      case TABS.VALIDATION_RESULTS:
        return <ValidationTab />;
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!(bpmnFile || hasSimParamsFile) && searchParams.get("tabIndex") !== null) {
      setSearchParams({ tabIndex: "" });
    }
  }, [bpmnFile, hasSimParamsFile, searchParams, setSearchParams]);

  const optimosConfigSave = useOptimosConfigSave(masterForm);
  const simulationParametersSave = useSimulationParametersSave(masterForm);

  const handleConfigSave = async () => {
    await optimosConfigSave();
    if (masterForm.formState.dirtyFields.simulationParameters !== undefined) {
      await simulationParametersSave();
    }
    masterForm.reset({}, { keepValues: true });
  };
  const createConstraintsFromSimParams = async () => {
    if (optimosConfigAsset || !projectId || !hasSimParamsFile) return;
    const simParams = getValues().simulationParameters;
    if (!simParams) return;
    const constraints = generateConstraints(simParams);

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
    <ProcessingAppSection heading="Optimization Configuration">
      {!(bpmnFile || hasSimParamsFile) && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg text-center">
          Select a Optimos Configuration and Simulation Model from the input assets on the left.
        </p>
      )}
      {bpmnFile && hasSimParamsFile && !hasConsParamsFile && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg text-center">
          You have only selected a Simulation Model, please select a Optimos Configuration file or click "Generate
          Constraints" below.
          <Button variant="contained" color="primary" onClick={createConstraintsFromSimParams}>
            Generate Constraints
          </Button>
        </p>
      )}

      {bpmnFile && hasSimParamsFile && hasConsParamsFile && (
        <FormProvider {...masterForm}>
          <form
            method="POST"
            onSubmit={masterForm.handleSubmit(
              async (e, t) => {
                await handleConfigSave();
                t?.target.submit();
              },
              () => {
                alert("There are still errors in the parameters, please correct them before submitting.");
              }
            )}
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
                              icon={<CustomStepIcon activeStep={activeStep} currentTab={valueTab} />}
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
  );
};
export default SetupOptimos;
