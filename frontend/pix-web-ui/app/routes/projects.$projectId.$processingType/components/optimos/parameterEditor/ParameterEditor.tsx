import type { AlertColor } from "@mui/material";
import YAML from "yaml";
import { Badge, Button, Grid, Stack, Step, StepButton, Stepper, Tooltip, useTheme } from "@mui/material";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect, useCallback, useContext } from "react";

import useFormState from "../hooks/useFormState";
import useJsonFile from "../hooks/useJsonFile";
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
import { SelectedAssetsContext, SetSelectedAssetsContext } from "~/routes/projects.$projectId.$processingType/contexts";
import { useOptimosTab } from "~/routes/projects.$projectId.$processingType/components/optimos/hooks/useOptimosTab";
import { ValidationTab } from "../validation/ValidationTab";
import { useYAMLFile } from "../hooks/useYAMLFile";
import { MasterFormData, useMasterFormData } from "../hooks/useMasterFormData";
import { CustomStepIcon } from "./CustomStepIcon";

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
  });
  const { formState, getValues, setValue } = masterForm;
  const { isSubmitted, errors, submitCount } = formState;

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

  const fromContentToBlob = (values: any) => {
    const content = JSON.stringify(values);
    const blob = new Blob([content], { type: "text/plain" });
    return blob;
  };

  const getConstraintsConfigBlob = useCallback((): Blob => {
    const values = getValues().constraints;
    const blob = fromContentToBlob(values);

    return blob;
  }, [getValues]);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!(bpmnFile || hasSimParamsFile) && searchParams.get("tabIndex") !== null) {
      setSearchParams({ tabIndex: "" });
    }
  }, [bpmnFile, hasSimParamsFile, searchParams, setSearchParams]);

  const handleConfigSave = useCallback(
    // save form data as configuration file, create or update the asset, and update the selected asset IDs
    async () => {
      if (!optimosConfigAsset) return;
      const { num_iterations, approach, algorithm, scenario_name } = getValues().scenarioProperties;

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
    [optimosConfigAsset, getValues, user, getConstraintsConfigBlob, setOptimosConfigAsset]
  );
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
      {bpmnFile && hasSimParamsFile && !hasConfigFile && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg text-center">
          You have only selected a Simulation Model, please select a Optimos Configuration file or click "Generate
          Constraints" below.
          <Button variant="contained" color="primary" onClick={createConstraintsFromSimParams}>
            Generate Constraints
          </Button>
        </p>
      )}

      {bpmnFile && hasSimParamsFile && hasConfigFile && (
        <FormProvider {...masterForm}>
          <form
            method="POST"
            onSubmit={masterForm.handleSubmit(async (e, t) => {
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
