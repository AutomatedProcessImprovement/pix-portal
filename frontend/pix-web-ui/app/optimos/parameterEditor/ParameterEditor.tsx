import type { AlertColor } from "@mui/material";
import {
  Badge,
  Button,
  ButtonGroup,
  Grid,
  Step,
  StepButton,
  StepIcon,
  Stepper,
  Tooltip,
  useTheme,
} from "@mui/material";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  Groups as GroupsIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
} from "@mui/icons-material";

import useFormState from "./useFormState";
import useJsonFile from "./useJsonFile";
import saveAs from "file-saver";
import useTabVisibility, { TABS } from "./useTabVisibility";
import SnackBar from "../SnackBar";
import GlobalConstraints from "../globalConstraints/GlobalConstraints";
import { useNavigate } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import RCons from "../resourceConstraints/ResourceConstraints";
import ScenarioConstraints from "../globalConstraints/ScenarioConstraints";
import { useInterval } from "usehooks-ts";
import OptimizationResults from "../dashboard/OptimizationResults";
import JSZip from "jszip";
import useSimParamsJsonFile from "./useSimParamsJsonFile";
import { timePeriodToBinary } from "../helpers";
import type { JsonReport, ScenarioProperties } from "~/shared/optimos_json_type";
import { UserContext } from "~/routes/contexts";
import { SelectedAssetsContext } from "~/routes/projects.$projectId.$processingType/contexts";
import type { Asset } from "~/services/assets";
import { AssetType, getAsset } from "~/services/assets";
import { useFileFromAsset } from "./useFetchedAsset";
import { FileType } from "~/services/files";
import { ProcessingRequestType } from "~/services/processing_requests";
import { createProcessingRequest } from "~/services/processing_requests.server";
import { useMatches } from "@remix-run/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { prosimosConfigurationSchema } from "~/routes/projects.$projectId.$processingType/components/prosimos/schema";

interface LocationState {
  bpmnFile: File;
  simParamsFile: File;
  consParamsFile: File;
}

const tooltip_desc: Record<string, string> = {
  GLOBAL_CONSTRAINTS: "Define the algorithm, approach and number of iterations",
  SCENARIO_CONSTRAINTS: "Define the top-level restrictions like the time granularity and the maximum work units",
  RESOURCE_CONSTRAINTS: "Define resource specific constraints, their maximum capacity and working masks",
  SIMULATION_RESULTS: "",
};

const ParameterEditor = () => {
  const navigate = useNavigate();
  const [snackMessage, setSnackMessage] = useState("");
  const theme = useTheme();
  const activeColor = theme.palette.info.dark;
  const successColor = theme.palette.success.light;
  const errorColor = theme.palette.error.light;
  const selectedAssets = useContext(SelectedAssetsContext);
  const user = useContext(UserContext);
  const projectId = useMatches().filter((match) => match.id === "routes/projects.$projectId")[0].params.projectId;

  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState("");

  const [activeStep, setActiveStep] = useState<TABS>(TABS.GLOBAL_CONSTRAINTS);
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined);

  const [isScenarioParamsValid, setIsScenarioParamsValid] = useState(true);

  //   const { bpmnFile, simParamsFile, consParamsFile } = state as LocationState
  const [bpmnFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.PROCESS_MODEL_BPMN);
  const [simParamsFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.SIMULATION_MODEL_PROSIMOS_JSON);
  const [consParamsFile] = useFileFromAsset(AssetType.OPTIMOS_CONFIGURATION, FileType.CONSTRAINTS_MODEL_OPTIMOS_JSON);

  console.log(bpmnFile, simParamsFile, consParamsFile);

  const { jsonData } = useJsonFile(consParamsFile || null);
  const { jsonData: simParamsData } = useSimParamsJsonFile(simParamsFile);

  const { formState } = useFormState(jsonData);
  const {
    formState: { errors, isValid, isSubmitted, submitCount },
    getValues,
    handleSubmit,
  } = formState;

  const { visibleTabs, getIndexOfTab } = useTabVisibility();

  const [optimizationReportFileName, setOptimizationReportFileName] = useState("");
  const [optimizationReportInfo, setOptimizationReportInfo] = useState<JsonReport | null>(null);

  const scenarioState = useForm<ScenarioProperties>({
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
    trigger: triggerScenario,
    formState: { errors: scenarioErrors },
  } = scenarioState;

  // validate both forms: scenario params and json fields
  useEffect(() => {
    // isValid doesn't work properly on init
    const isJsonParamsValid = Object.keys(errors)?.length === 0;

    if (!isScenarioParamsValid || !isJsonParamsValid) {
      console.log(errors);
      setErrorMessage("There are validation errors");
    }
  }, [isSubmitted, submitCount]);

  useInterval(
    () => {
      // TODO
      //   getTaskByTaskId(pendingTaskId)
      //     .then((result: any) => {
      //       const dataJson = result.data;
      //       if (dataJson.TaskStatus === "STARTED") {
      //         setInfoMessage("Optimization still in progress...");
      //       }
      //     })
      //     .catch((error: any) => {
      //       setIsPollingEnabled(false);
      //       console.log(error);
      //       console.log(error.response);
      //     });
    },
    isPollingEnabled ? 60000 : null
  );

  useInterval(
    () => {
      // TODO
      //   getTaskByTaskId(pendingTaskId)
      //     .then((result: any) => {
      //       const dataJson = result.data;
      //       if (dataJson.TaskStatus === "SUCCESS") {
      //         setIsPollingEnabled(false);
      //         setOptimizationReportFileName(dataJson.TaskResponse.stat_path);
      //         setOptimizationReportInfo(dataJson.TaskResponse.report);
      //         // redirect to results step
      //         setActiveStep(TABS.SIMULATION_RESULTS);
      //         // hide info message
      //         onSnackbarClose();
      //       } else if (dataJson.TaskStatus === "FAILURE") {
      //         setIsPollingEnabled(false);
      //         console.log(dataJson);
      //         setErrorMessage("Simulation Task failed");
      //       }
      //     })
      //     .catch((error: any) => {
      //       setIsPollingEnabled(false);
      //       console.log(error);
      //       console.log(error.response);
      //       const errorMessage = error?.response?.data?.displayMessage || "Something went wrong";
      //       setErrorMessage("Task Executing: " + errorMessage);
      //     });
    },
    isPollingEnabled ? 3000 : null
  );

  const setErrorMessage = (value: string) => {
    setSnackColor("error");
    setSnackMessage(value);
  };

  const setInfoMessage = (value: string) => {
    setSnackColor("info");
    setSnackMessage(value);
  };

  const onSnackbarClose = () => {
    setErrorMessage("");
  };

  const onStartOver = () => {
    // TODO
  };

  const getStepContent = (index: TABS) => {
    switch (index) {
      case TABS.GLOBAL_CONSTRAINTS:
        return (
          <GlobalConstraints
            scenarioFormState={scenarioState}
            jsonFormState={formState}
            setErrorMessage={setErrorMessage}
          />
        );
      case TABS.SCENARIO_CONSTRAINTS:
        return (
          <ScenarioConstraints
            scenarioFormState={scenarioState}
            jsonFormState={formState}
            setErrorMessage={setErrorMessage}
          />
        );
      case TABS.RESOURCE_CONSTRAINTS:
        return <RCons setErrorMessage={setErrorMessage} formState={formState} />;
      case TABS.SIMULATION_RESULTS:
        if (optimizationReportInfo) {
          console.log(optimizationReportInfo);
          return (
            <OptimizationResults reportJson={optimizationReportInfo} reportFileName={optimizationReportFileName} />
          );
        }
        return <></>;
    }
  };
  const getStepIcon = (currentTab: TABS): React.ReactNode => {
    const isActiveStep = activeStep === currentTab;
    const styles = isActiveStep ? { color: activeColor } : {};

    let Icon: React.ReactNode;
    let currError: any;
    let lastStep = false;
    switch (currentTab) {
      case TABS.GLOBAL_CONSTRAINTS:
        currError = scenarioErrors;
        Icon = <BuildIcon style={styles} />;
        break;
      case TABS.SCENARIO_CONSTRAINTS:
        currError =
          errors.time_var ??
          errors.hours_in_day ??
          errors.max_cap ??
          errors.max_shift_size ??
          errors.hours_in_day ??
          errors.max_shift_blocks;
        Icon = <SettingsIcon style={styles} />;
        break;
      case TABS.RESOURCE_CONSTRAINTS:
        currError = errors.hours_in_day;
        Icon = <GroupsIcon style={styles} />;
        break;
      case TABS.SIMULATION_RESULTS:
        lastStep = true;
        Icon = <BarChartIcon style={styles} />;
        break;
      default:
        return <></>;
    }

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

    const areAnyErrors = currError && (currError.length > 0 || Object.keys(currError)?.length > 0);
    const finalIcon =
      isSubmitted && !lastStep ? (
        <Badge badgeContent={getBadgeContent(areAnyErrors)} overlap="circular">
          {" "}
          {Icon}
        </Badge>
      ) : (
        Icon
      );

    return <StepIcon active={isActiveStep} icon={finalIcon} />;
  };

  const onDownloadScenarioFilesAsZip = () => {
    const files = [bpmnFile, simParamsFile, consParamsFile];
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file);
    });
    zip
      .generateAsync({ type: "blob" })
      .then(function (content: any) {
        saveAs(content, "files.zip");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fromContentToBlob = (values: any) => {
    const content = JSON.stringify(values);
    const blob = new Blob([content], { type: "text/plain" });
    return blob;
  };

  const noInvalidOverlap = (): boolean => {
    const values = getValues();

    console.log(simParamsData);
    console.log(values);

    if (simParamsData && values) {
      const sp_tcs = simParamsData.resource_calendars;
      const cp_ttb = values.resources;

      for (const sp_tc of sp_tcs) {
        const key_id = sp_tc.id;
        const timePeriods = sp_tc.time_periods;

        let cons_equal;
        for (const constraint of cp_ttb) {
          if (constraint.id === key_id) {
            cons_equal = constraint;
          }
        }

        let monday = 0;
        let tuesday = 0;
        let wednesday = 0;
        let thursday = 0;
        let friday = 0;
        let saturday = 0;
        let sunday = 0;

        for (const timePeriod of timePeriods) {
          const fromKey = timePeriod.from;
          switch (fromKey) {
            case "MONDAY":
              monday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "TUESDAY":
              tuesday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "WEDNESDAY":
              wednesday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "THURSDAY":
              thursday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "FRIDAY":
              friday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "SATURDAY":
              saturday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            case "SUNDAY":
              sunday |= timePeriodToBinary(timePeriod.beginTime, timePeriod.endTime, values.time_var, 24);
              break;
            default:
              console.log("r");
          }
        }
        // Resource maps have been built, now crosscheck for overlaps with masks
        const all_ok = [false, false, false, false, false, false, false];
        const all_ok2 = [false, false, false, false, false, false, false];
        if (cons_equal) {
          // checks for masks
          if (
            (cons_equal.constraints.never_work_masks.monday | cons_equal.constraints.always_work_masks.monday) ===
            (cons_equal.constraints.never_work_masks.monday ^ cons_equal.constraints.always_work_masks.monday)
          ) {
            all_ok2[0] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.tuesday | cons_equal.constraints.always_work_masks.tuesday) ===
            (cons_equal.constraints.never_work_masks.tuesday ^ cons_equal.constraints.always_work_masks.tuesday)
          ) {
            all_ok2[1] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.wednesday | cons_equal.constraints.always_work_masks.wednesday) ===
            (cons_equal.constraints.never_work_masks.wednesday ^ cons_equal.constraints.always_work_masks.wednesday)
          ) {
            all_ok2[2] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.thursday | cons_equal.constraints.always_work_masks.thursday) ===
            (cons_equal.constraints.never_work_masks.thursday ^ cons_equal.constraints.always_work_masks.thursday)
          ) {
            all_ok2[3] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.friday | cons_equal.constraints.always_work_masks.friday) ===
            (cons_equal.constraints.never_work_masks.friday ^ cons_equal.constraints.always_work_masks.friday)
          ) {
            all_ok2[4] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.saturday | cons_equal.constraints.always_work_masks.saturday) ===
            (cons_equal.constraints.never_work_masks.saturday ^ cons_equal.constraints.always_work_masks.saturday)
          ) {
            all_ok2[5] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.sunday | cons_equal.constraints.always_work_masks.sunday) ===
            (cons_equal.constraints.never_work_masks.sunday ^ cons_equal.constraints.always_work_masks.sunday)
          ) {
            all_ok2[6] = true;
          }

          // Checks for timetables over masks
          if (
            (cons_equal.constraints.never_work_masks.monday & monday) === 0 &&
            (cons_equal.constraints.always_work_masks.monday & monday) ===
              cons_equal.constraints.always_work_masks.monday
          ) {
            all_ok[0] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.tuesday & tuesday) === 0 &&
            (cons_equal.constraints.always_work_masks.tuesday & tuesday) ===
              cons_equal.constraints.always_work_masks.tuesday
          ) {
            all_ok[1] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.wednesday & wednesday) === 0 &&
            (cons_equal.constraints.always_work_masks.wednesday & wednesday) ===
              cons_equal.constraints.always_work_masks.wednesday
          ) {
            all_ok[2] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.thursday & thursday) === 0 &&
            (cons_equal.constraints.always_work_masks.thursday & thursday) ===
              cons_equal.constraints.always_work_masks.thursday
          ) {
            all_ok[3] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.friday & friday) === 0 &&
            (cons_equal.constraints.always_work_masks.friday & friday) ===
              cons_equal.constraints.always_work_masks.friday
          ) {
            all_ok[4] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.saturday & saturday) === 0 &&
            (cons_equal.constraints.always_work_masks.saturday & saturday) ===
              cons_equal.constraints.always_work_masks.saturday
          ) {
            all_ok[5] = true;
          }
          if (
            (cons_equal.constraints.never_work_masks.sunday & sunday) === 0 &&
            (cons_equal.constraints.always_work_masks.sunday & sunday) ===
              cons_equal.constraints.always_work_masks.sunday
          ) {
            all_ok[6] = true;
          }
        }
        if (!all_ok2.every((v) => v)) {
          setErrorMessage(
            "An invalid mask overlap has been found. Check the masks of " + key_id + " before trying again"
          );
          return false;
        }

        if (!all_ok.every((v) => v)) {
          setErrorMessage(
            "An invalid timetable overlap has been found. Make sure the masks and timetable do no overlap in " + key_id
          );
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const getBlobBasedOnExistingInput = (): Blob => {
    const values = getValues();
    const blob = fromContentToBlob(values);

    return blob;
  };

  const onStartOptimization = async () => {
    const isScenarioValid = await triggerScenario();
    setIsScenarioParamsValid(isScenarioValid);

    if (!isValid || !isScenarioValid) {
      // scenario params or json params
      // or values used for prioritisation rules
      // or all of them are not valid
      return;
    }

    const canContinue = noInvalidOverlap();
    // TODO Save Blob to input asset!
    const newBlob = getBlobBasedOnExistingInput();
    const { num_iterations, approach, algorithm, scenario_name } = getScenarioValues();

    // return

    if (canContinue) {
      setInfoMessage("Optimization started...");
      await createProcessingRequest(
        ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_OPTIMOS,
        projectId!,
        selectedAssets.map((asset) => asset.id),
        false,
        user!.token!
      );
    }
  };

  if (!bpmnFile || !simParamsFile || !consParamsFile) {
    return <div>Please select the required Assets</div>;
  }

  return (
    <FormProvider {...scenarioState}>
      <form method="POST">
        <input type="hidden" name="selectedInputAssetsIds" value={selectedAssets.map((asset) => asset.id).join(",")} />
        <input type="hidden" name="shouldNotify" value="off" />
        <input type="hidden" name="projectId" value={projectId} />

        <Grid container alignItems="center" justifyContent="center">
          <Grid item xs={10} sx={{ paddingTop: "10px" }}>
            <Grid container item xs={12}>
              <Grid item container justifyContent="center">
                <ButtonGroup>
                  <Button type="submit">Start Optimization</Button>
                </ButtonGroup>
              </Grid>
            </Grid>
            <Grid item container xs={12} alignItems="center" justifyContent="center" sx={{ paddingTop: "20px" }}>
              <Stepper nonLinear alternativeLabel activeStep={getIndexOfTab(activeStep)} connector={<></>}>
                {Object.entries(visibleTabs.getAllItems()).map(([key, label]: [string, string]) => {
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
        </Grid>
      </form>
    </FormProvider>
  );
};
export default ParameterEditor;
