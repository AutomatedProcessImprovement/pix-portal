import { Button, Grid, Paper, Typography, Box, ButtonGroup, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import YAML from "yaml";
import * as React from "react";
import "moment-duration-format";
import type { FullOutputJson } from "~/shared/optimos_json_type";
import { formatCurrency, formatPercentage, formatSeconds } from "~/shared/num_helper";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";
import { WeekView } from "~/components/optimos/WeekView";
import { OptimosSolution } from "./OptimosSolution";
import { InitialSolutionContext } from "./InitialSolutionContext";
import { useAutoRefreshRequest } from "~/routes/projects.$projectId.$processingType/hooks/useAutoRefreshRequest";
import { FileType, getFile, getFileContent } from "~/services/files";
import { UserContext } from "~/routes/contexts";
import type { ProcessingRequest } from "~/services/processing_requests";
import { SolutionChart } from "./SolutionChart";
import { useFileFromAsset } from "~/routes/projects.$projectId.$processingType/components/optimos/hooks/useFetchedAsset";
import { AssetType, getAsset } from "~/services/assets";

interface SimulationResultsProps {
  report: FullOutputJson;
  processingRequest: ProcessingRequest;
}

const OptimizationResults = (props: SimulationResultsProps) => {
  const user = React.useContext(UserContext);
  const { report: reportJson, processingRequest: initialRequest } = props;
  const [report, setReport] = useState<FullOutputJson | null>(reportJson);

  const [scenarioName, setScenarioName] = useState("");

  useEffect(
    () =>
      void (async () => {
        if (!user?.token) return;

        const assets = await Promise.all(initialRequest.input_assets_ids.map((i) => getAsset(i, user!.token!, false)));
        const configAsset = assets.find((a) => a.type === AssetType.OPTIMOS_CONFIGURATION);
        const configFileId = configAsset?.files?.find((file) => file.type === FileType.CONFIGURATION_OPTIMOS_YAML)?.id;
        if (!configFileId) return;
        const fileContent = await getFileContent(configFileId, user?.token);

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (content) {
            const config = YAML.parse(content as string);
            setScenarioName(config.scenario_name);
          }
        };
        reader.readAsText(fileContent);
      })(),
    [initialRequest, user, user?.token]
  );
  const request = useAutoRefreshRequest(initialRequest);
  var oldFileId = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!request || !user) return;
      const fileIds = request.output_assets[0].files_ids;
      const files = await Promise.all(fileIds.map((id) => getFile(id, user.token!)));
      const optimosReportJsonFile = files?.find((file) => file.type === FileType.OPTIMIZATION_REPORT_OPTIMOS_JSON);

      if (!optimosReportJsonFile) return;
      if (oldFileId.current === optimosReportJsonFile.id) return;
      oldFileId.current = optimosReportJsonFile.id;
      console.log("Getting Content");
      const fileContent = await getFileContent(optimosReportJsonFile.id, user.token!);
      const jsonStr = await fileContent.text();
      const newReport = JSON.parse(jsonStr);
      console.log("Downloaded new Json");
      setReport(newReport);
    })();
  }, [request, user]);

  const [fileDownloadUrl, setFileDownloadUrl] = useState("");

  const linkDownloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (fileDownloadUrl !== "" && fileDownloadUrl !== undefined) {
      linkDownloadRef.current?.click();
      URL.revokeObjectURL(fileDownloadUrl);
    }
  }, [fileDownloadUrl]);

  const onDownload = () => {
    const blob = new Blob([JSON.stringify(reportJson)], {
      type: "application/json",
    });

    const optimizationReportFile = new File([blob], "name", {
      type: "application/json",
    });
    const fileDownloadUrl = URL.createObjectURL(optimizationReportFile);
    setFileDownloadUrl(fileDownloadUrl);
  };

  const writeName = (item: any) => {
    switch (item.name) {
      case "HC_FLEX_CO":
        return "Hill climb FLEX - Combined";
      case "HC_FLEX_O_C":
        return "Hill climb FLEX - Only calendar";
      case "HC_FLEX_O_A_R":
        return "Hill climb FLEX - Only add/remove";
      case "HC_FLEX_F_CA_T_A_R":
        return "Hill climb FLEX - First calendar, then add/remove";
      case "HC_FLEX_F_A_R_T_CA":
        return "Hill climb FLEX - First add/remove, then calendar";
      default:
        return "Unknown";
    }
  };

  if (!report) return <div>Loading...</div>;
  const final_metrics = report.final_solution_metrics?.[0];
  const initial_solution = report.initial_solution;

  return (
    <InitialSolutionContext.Provider value={initial_solution}>
      <div style={{ height: "50px" }} />

      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={4}
        style={{ paddingTop: "10px" }}
        className="centeredContent"
      >
        <Grid item xs={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <h1 className="text-3xl font-semibold">Your Optimization Report</h1>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 3, minHeight: "10vw" }}>
                <Grid container>
                  <Grid item xs={8}>
                    <Typography variant="h5" align="left">
                      {scenarioName}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} justifyContent="flexEnd" textAlign={"right"}>
                    <Button
                      type="button"
                      variant="contained"
                      onClick={(_e) => {
                        onDownload();
                      }}
                      startIcon={<CloudDownloadIcon />}
                    >
                      Report
                    </Button>
                    <a
                      style={{ display: "none" }}
                      download={"report.json"}
                      href={fileDownloadUrl}
                      ref={linkDownloadRef}
                    >
                      Download json
                    </a>
                  </Grid>
                  {final_metrics ? (
                    <Grid container>
                      <Grid item xs={5}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                          }}
                          align={"left"}
                        >
                          Average cost
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                          }}
                          align={"left"}
                        >
                          Average cycle time
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: "bold",
                          }}
                          align={"left"}
                        >
                          Cost compared to original
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                          }}
                          align={"left"}
                        >
                          Time compared to original
                        </Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <Typography align={"left"}> {formatCurrency(final_metrics?.ave_cost)}</Typography>
                        <Typography align={"left"}> {formatSeconds(final_metrics?.ave_time)}</Typography>
                        <Typography align={"left"}> {formatPercentage(1 / final_metrics?.cost_metric)}</Typography>
                        <Typography align={"left"}> {formatPercentage(1 / final_metrics?.time_metric)}</Typography>
                      </Grid>

                      <SolutionChart
                        solutions={report.final_solutions ?? []}
                        initialSolution={report.initial_solution}
                        averageCost={final_metrics.ave_cost}
                        averageTime={final_metrics.ave_time}
                      />
                    </Grid>
                  ) : (
                    <Grid container p={10}>
                      <Grid container justifyContent="center">
                        <Grid item>
                          <CircularProgress size={60} />
                        </Grid>
                      </Grid>
                      <Grid container justifyContent="center">
                        <Grid item>
                          <Typography variant="body1" align="center">
                            The Process is still running, below you find the current iteration
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>
              <Grid container>
                {!report?.final_solutions && report.current_solution && (
                  <Grid item xs={12}>
                    <OptimosSolution
                      solution={report.current_solution}
                      finalMetrics={final_metrics}
                      initialSolution={initial_solution}
                    ></OptimosSolution>
                  </Grid>
                )}
                {report?.final_solutions?.map((solution, index) => {
                  return (
                    <Grid item xs={12} key={`grid-${index}`} id={"solution_" + index}>
                      <OptimosSolution
                        key={index}
                        solution={solution}
                        finalMetrics={final_metrics}
                        initialSolution={initial_solution}
                      ></OptimosSolution>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </InitialSolutionContext.Provider>
  );
};

export default OptimizationResults;
