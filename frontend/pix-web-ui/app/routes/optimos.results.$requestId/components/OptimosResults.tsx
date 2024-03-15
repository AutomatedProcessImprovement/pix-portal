import { Button, Grid, Paper, Typography, Box, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import "moment-duration-format";
import type { FullOutputJson } from "~/shared/optimos_json_type";
import { formatCurrency, formatPercentage, formatSeconds } from "~/shared/num_helper";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";

interface SimulationResultsProps {
  report: FullOutputJson;
}

const OptimizationResults = (props: SimulationResultsProps) => {
  const { report: reportJson } = props;
  const [report, setReport] = useState<FullOutputJson | null>();

  const [fileDownloadUrl, setFileDownloadUrl] = useState("");
  const [fileDownloadSimParams, setFileDownloadSimParams] = useState("");
  const [fileDownloadConsParams, setFileDownloadConsParams] = useState("");
  const linkDownloadRef = useRef<HTMLAnchorElement>(null);
  const link2DownloadRef = useRef<HTMLAnchorElement>(null);
  const link3DownloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setReport(reportJson);
  }, [reportJson]);

  useEffect(() => {
    if (fileDownloadUrl !== "" && fileDownloadUrl !== undefined) {
      linkDownloadRef.current?.click();
      URL.revokeObjectURL(fileDownloadUrl);
    }
  }, [fileDownloadUrl]);

  useEffect(() => {
    if (fileDownloadSimParams !== "" && fileDownloadSimParams !== undefined) {
      link2DownloadRef.current?.click();
      URL.revokeObjectURL(fileDownloadSimParams);
    }
  }, [fileDownloadSimParams]);

  useEffect(() => {
    if (fileDownloadConsParams !== "" && fileDownloadConsParams !== undefined) {
      link3DownloadRef.current?.click();
      URL.revokeObjectURL(fileDownloadConsParams);
    }
  }, [fileDownloadConsParams]);

  const onDownloadEntrySimParams = (entry: any) => {
    const blob = new Blob([JSON.stringify(entry)], {
      type: "application/json",
    });

    const entry_parameters_file = new File([blob], "name", {
      type: "application/json",
    });
    const fileDownloadUrl = URL.createObjectURL(entry_parameters_file);
    setFileDownloadSimParams(fileDownloadUrl);
  };

  const onDownloadEntryConsParams = (entry: any) => {
    const blob = new Blob([JSON.stringify(entry)], {
      type: "application/json",
    });

    const entry_parameters_file = new File([blob], "name", {
      type: "application/json",
    });
    const fileDownloadUrl = URL.createObjectURL(entry_parameters_file);
    setFileDownloadConsParams(fileDownloadUrl);
  };

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

  const final_metrics = report?.final_solution_metrics?.[0];

  if (!report) return <h1>Error!</h1>;

  return (
    <>
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
              <h1 className="text-3xl font-semibold">Your Simulation Report</h1>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 3, minHeight: "10vw" }}>
                <Grid container>
                  <Grid item xs={8}>
                    <Typography variant="h5" align="left">
                      {report?.name}
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
                      Pareto size
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                      }}
                      align={"left"}
                    >
                      # in Pareto
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
                    <Typography align={"left"}> {final_metrics?.pareto_size}</Typography>
                    <Typography align={"left"}> {final_metrics?.in_jp}</Typography>
                    <Typography align={"left"}> {formatPercentage(final_metrics?.cost_metric)}</Typography>
                    <Typography align={"left"}> {formatPercentage(final_metrics?.time_metric)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Grid container>
                {report?.final_solutions?.map((solution, index) => {
                  return (
                    <Grid item xs={6} key={`grid-${index}`}>
                      <Paper elevation={5} sx={{ m: 3, p: 3, minHeight: "10vw" }}>
                        <Grid>
                          <Typography variant="h6" align="left">
                            Variant #{solution.solution_space.it_number}
                          </Typography>
                        </Grid>
                        <Grid
                          container
                          sx={{
                            paddingTop: 1,
                          }}
                        >
                          <Grid item xs={5}>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                              align={"left"}
                            >
                              Median cost
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                              align={"left"}
                            >
                              Median time
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                              align={"left"}
                            >
                              Avg. Resource Utilization
                            </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography align={"left"}>
                              {formatCurrency(solution.solution_space.median_execution_cost)}
                              {final_metrics &&
                                (final_metrics.ave_cost > solution.solution_space.median_execution_cost ? (
                                  <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
                                ) : (
                                  <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
                                ))}
                            </Typography>
                            <Typography align={"left"}>
                              {formatSeconds(solution.solution_space.median_cycle_time)}
                              {final_metrics &&
                                (final_metrics.ave_time > solution.solution_space.median_cycle_time ? (
                                  <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
                                ) : (
                                  <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
                                ))}
                            </Typography>
                            <Typography align={"left"}>
                              {formatPercentage(
                                Object.values(solution.resources_info).reduce(
                                  (acc, resource) => acc + resource.resource_utilization,
                                  0
                                ) / Object.keys(solution.resources_info).length
                              )}
                            </Typography>
                          </Grid>
                          <a
                            style={{
                              display: "none",
                            }}
                            download={"constraints.json"}
                            href={fileDownloadConsParams}
                            ref={link3DownloadRef}
                          >
                            Download json
                          </a>
                          <a
                            style={{
                              display: "none",
                            }}
                            download={"simparams.json"}
                            href={fileDownloadSimParams}
                            ref={link2DownloadRef}
                          >
                            Download json
                          </a>
                          <Grid item xs={12} mt={1}>
                            <ButtonGroup variant="outlined" aria-label="Download parameters">
                              <Button
                                onClick={(_e) => {
                                  onDownloadEntrySimParams(solution.sim_params);
                                }}
                                startIcon={<CloudDownloadIcon />}
                              >
                                Parameters
                              </Button>
                              <Button
                                onClick={(_e) => {
                                  onDownloadEntryConsParams(solution.cons_params);
                                }}
                                startIcon={<CloudDownloadIcon />}
                              >
                                Constraints
                              </Button>
                            </ButtonGroup>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default OptimizationResults;
