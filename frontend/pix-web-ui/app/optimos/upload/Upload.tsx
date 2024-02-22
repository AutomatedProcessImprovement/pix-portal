import { useEffect, useState } from "react";
import { FormControlLabel, Grid, Paper, Switch, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FileUploader from "../FileUploader";
import paths from "../../router/paths";
import { useNavigate } from "react-router";
import SnackBar from "../SnackBar";
import FileDropzoneArea from "./FileDropzoneArea";
import JSZip from "jszip";
import { useInterval } from "usehooks-ts";
import { generateConstraints, getTaskByTaskId } from "../../api/api";

const Upload = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [simParams, setSimParams] = useState<File | null>(null);
  const [consParams, setConsParams] = useState<File | null>(null);
  const [bpmnModel, setBpmnModel] = useState<File | null>(null);
  const [combinedFiles, setCombinedFiles] = useState<File | File[]>();

  const [snackMessage, setSnackMessage] = useState("");
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined);

  const navigate = useNavigate();

  const [wantGenerateConstraints, setWantGenerateConstraints] = useState<boolean>(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState("");

  const [isValidConstraints, setIsValidConstraints] = useState<boolean>(false);
  const [isValidSimParams, setIsValidSimParams] = useState<boolean>(false);

  useInterval(
    () => {
      getTaskByTaskId(pendingTaskId)
        .then((result: any) => {
          const dataJson = result.data;
          if (dataJson.TaskStatus === "SUCCESS") {
            setIsPollingEnabled(false);
            console.log(dataJson);

            const blob = new Blob([JSON.stringify(dataJson.TaskResponse.constraints)], { type: "application/json" });

            const consParamsGenerated = new File([blob], "name", {
              type: "application/json",
            });
            setConsParams(consParamsGenerated);

            // hide info message
            onSnackbarClose();

            navigate(paths.PARAMEDITOR_PATH, {
              state: {
                bpmnFile: bpmnModel,
                simParamsFile: simParams,
                consParamsFile: consParamsGenerated,
              },
            });
          } else if (dataJson.TaskStatus === "FAILURE") {
            setIsPollingEnabled(false);

            console.log(dataJson);
            setErrorMessage("An error occurred.");
          }
        })
        .catch((error: any) => {
          setIsPollingEnabled(false);

          console.log(error);
          console.log(error.response);
          const errorMessage = error?.response?.data?.displayMessage || "Something went wrong";
          setErrorMessage("Task Executing: " + errorMessage);
        });
    },
    isPollingEnabled ? 3000 : null
  );

  useEffect(() => {
    const asyncFn = async () => {
      if (combinedFiles === undefined) {
        setSimParams(null);
        setBpmnModel(null);
        setConsParams(null);
        setIsValidConstraints(false);
        setIsValidSimParams(false);
        return;
      }
      if (Array.isArray(combinedFiles)) {
        for (const combinedFile of combinedFiles) {
          if (combinedFile.name.endsWith(".bpmn")) {
            setBpmnModel(combinedFile);
          }
          if (combinedFile.name.endsWith(".json")) {
            if (combinedFile.name.includes("constraints")) {
              const jsonFileReader = new FileReader();
              jsonFileReader.readAsText(combinedFile, "UTF-8");
              jsonFileReader.onload = (e) => {
                if (e.target?.result && typeof e.target?.result === "string") {
                  const rawData = JSON.parse(e.target.result);
                  setIsValidConstraints(rawData.time_var && rawData.resources);
                }
              };
              setConsParams(combinedFile);
            } else {
              const jsonFileReader = new FileReader();
              jsonFileReader.readAsText(combinedFile, "UTF-8");
              jsonFileReader.onload = (e) => {
                if (e.target?.result && typeof e.target?.result === "string") {
                  const rawData = JSON.parse(e.target.result);
                  setIsValidConstraints(rawData.resource_profiles && rawData.resource_calendars);
                }
              };
              setSimParams(combinedFile);
            }
          }
        }
      } else {
        const zip = new JSZip();
        try {
          const content = await zip.loadAsync(combinedFiles);

          for (const contentFile of Object.values(content.files)) {
            if (contentFile.name.endsWith(".bpmn")) {
              const fileData = await contentFile.async("blob");

              const f = new File([fileData], "model.bpmn");
              setBpmnModel(f);
            }
            if (contentFile.name.endsWith(".json")) {
              const fileData = await contentFile.async("blob");
              if (contentFile.name.includes("constraints")) {
                const f = new File([fileData], contentFile.name);
                const jsonFileReader = new FileReader();
                jsonFileReader.readAsText(f, "UTF-8");
                jsonFileReader.onload = (e) => {
                  if (e.target?.result && typeof e.target?.result === "string") {
                    const rawData = JSON.parse(e.target.result);
                    setIsValidConstraints(rawData.time_var && rawData.resources);
                  }
                };
                setConsParams(f);
              } else {
                const f = new File([fileData], contentFile.name);
                const jsonFileReader = new FileReader();
                jsonFileReader.readAsText(f, "UTF-8");
                jsonFileReader.onload = (e) => {
                  if (e.target?.result && typeof e.target?.result === "string") {
                    const rawData = JSON.parse(e.target.result);
                    setIsValidConstraints(rawData.resource_profiles && rawData.resource_calendars);
                  }
                };
                setSimParams(f);
              }
            }
          }
        } catch (error) {
          setErrorMessage(String(error));
        }
      }
    };
    void asyncFn();
  }, [combinedFiles]);

  const areFilesPresent = () => {
    if (!wantGenerateConstraints) {
      return simParams !== null && consParams !== null && bpmnModel !== null;
    } else {
      return simParams !== null && bpmnModel !== null;
    }
  };

  const onBpmnModelChange = (file: File) => {
    setBpmnModel(file);
  };
  const onSimParamsChange = (file: File) => {
    setSimParams(file);
  };
  const onConsParamsChange = (file: File) => {
    setConsParams(file);
  };

  const setInfoMessage = (value: string) => {
    updateSnackMessage(value);
    setSnackColor("info");
  };

  const setErrorMessage = (value: string) => {
    updateSnackMessage(value);
    setSnackColor("error");
  };

  const updateSnackMessage = (text: string) => {
    setSnackMessage(text);
  };

  const onSnackbarClose = () => {
    updateSnackMessage("");
  };

  const handleRequest = async () => {
    setLoading(true);

    if (wantGenerateConstraints) {
      setInfoMessage("Generating constraints...");

      if (simParams !== null) {
        generateConstraints(simParams)
          .then((result) => {
            const dataJson = result.data;
            console.log(dataJson.TaskId);
            console.log("in generate");

            if (dataJson.TaskId) {
              setIsPollingEnabled(true);
              setPendingTaskId(dataJson.TaskId);
            }
          })
          .catch((error: any) => {
            console.log(error.response);
            setErrorMessage(error.response.data.displayMessage);
          });
      }
    }
    if (!areFilesPresent() && !isValidConstraints && !isValidSimParams) {
      return;
    }

    if (!wantGenerateConstraints) {
      navigate(paths.PARAMEDITOR_PATH, {
        state: {
          bpmnFile: bpmnModel,
          simParamsFile: simParams,
          consParamsFile: consParams,
        },
      });
    }
  };

  const handleSwitch = (e: { target: { checked: boolean | ((prevState: boolean) => boolean) } }) => {
    setWantGenerateConstraints(e.target.checked);
  };

  return (
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={4}
        style={{ paddingTop: "30px" }}
        className="centeredContent"
      >
        <Grid item xs={6}>
          <Paper elevation={5} sx={{ p: 3, minHeight: "25vw" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" align="center">
                  Run optimization
                </Typography>
                <br />
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item xs={3}>
                        <Typography variant="body1" align="left" sx={{ fontWeight: "bold" }}>
                          Supported extensions:
                        </Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography variant="body1" align="left">
                          bpmn | json | zip
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container sx={{ paddingTop: "5%" }}>
                <Grid item className="centeredContent" xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked={false} onChange={handleSwitch} />}
                    label="Generate constraints?"
                  />
                </Grid>
                <Grid container sx={{ paddingTop: "5%" }}>
                  <Grid item xs={4}>
                    <Typography>BPMN Model</Typography>
                    <br />
                    <FileUploader
                      file={bpmnModel}
                      startId="bpmn_file"
                      ext=".bpmn"
                      onFileChange={onBpmnModelChange}
                      setErrorMessage={setErrorMessage}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>Simulation Parameters</Typography>
                    <br />
                    <FileUploader
                      file={simParams}
                      startId="simparams_file"
                      ext=".json"
                      onFileChange={onSimParamsChange}
                      setErrorMessage={setErrorMessage}
                    />
                  </Grid>
                  {!wantGenerateConstraints && (
                    <Grid item xs={4}>
                      <Typography>Constraints Parameters</Typography>
                      <br />
                      <FileUploader
                        file={consParams}
                        startId="consparams_file"
                        ext=".json"
                        onFileChange={onConsParamsChange}
                        setErrorMessage={setErrorMessage}
                      />
                    </Grid>
                  )}
                </Grid>
                <Grid item sx={{ paddingTop: "5%" }} className="centeredContent" xs={12}>
                  <FileDropzoneArea
                    acceptedFiles={[".zip", ".json", ".bpmn"]}
                    setSelectedFiles={setCombinedFiles}
                    filesLimit={3}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Grid item xs={12} sx={{ paddingTop: "20px" }}>
            <LoadingButton
              disabled={!areFilesPresent() && !isValidConstraints && !isValidSimParams}
              variant="contained"
              onClick={handleRequest}
              loading={loading}
              sx={{ width: "250px" }}
            >
              Next
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
      {snackMessage && <SnackBar message={snackMessage} onSnackbarClose={onSnackbarClose} severityLevel={snackColor} />}
    </>
  );
};

export default Upload;
