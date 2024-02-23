import { Button, Grid, Paper, Typography, Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import "moment-duration-format";
import type { JsonReport } from "~/shared/optimos_json_type";
import { formatCurrency, formatPercentage, formatSeconds } from "~/shared/num_helper";

interface SimulationResultsProps {
  report: JsonReport;
}

const OptimizationResults = (props: SimulationResultsProps) => {
  const { report: reportJson } = props;
  const [report, setReport] = useState<JsonReport | null>();

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

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

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

  return (
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={4}
        style={{ paddingTop: "15px", paddingBottom: "5px" }}
        className="centeredContent"
      >
        <Grid item xs={3} sx={{ paddingTop: "20px" }} textAlign={"center"}>
          <Button
            type="button"
            variant="contained"
            onClick={(_e) => {
              onDownload();
            }}
          >
            Download entire report
          </Button>
          <a style={{ display: "none" }} download={"report.json"} href={fileDownloadUrl} ref={linkDownloadRef}>
            Download json
          </a>
        </Grid>
      </Grid>
      {report?.map((item, idx) => {
        return (
          <Grid
            key={`report-${idx}`}
            container
            alignItems="center"
            justifyContent="center"
            spacing={4}
            style={{ paddingTop: "10px" }}
            className="centeredContent"
          >
            <Grid item xs={8}>
              <Paper elevation={5} sx={{ p: 3, minHeight: "10vw" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h4" align="center">
                      {writeName(item)}
                    </Typography>
                    <br />
                    <Grid container>
                      {/* { report.map((item: any) => { */}
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
                          <Typography align={"left"}> {formatCurrency(item.ave_cost)}</Typography>
                          <Typography align={"left"}> {formatSeconds(item.ave_time)}</Typography>
                          <Typography align={"left"}> {item.pareto_size}</Typography>
                          <Typography align={"left"}> {item.in_jp}</Typography>
                          <Typography align={"left"}> {formatPercentage(item.cost_metric)}</Typography>
                          <Typography align={"left"}> {formatPercentage(item.time_metric)}</Typography>
                        </Grid>
                        <Grid container>
                          <Typography
                            variant={"h5"}
                            align={"left"}
                            sx={{
                              paddingTop: 1,
                            }}
                          >
                            {" "}
                            Pareto values
                          </Typography>
                          {item.pareto_values.map((entry, index) => {
                            return (
                              <Grid
                                key={`grid-${index}`}
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
                                    {" "}
                                    Entry ID
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                    }}
                                    align={"left"}
                                  >
                                    {" "}
                                    Median cost
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                    }}
                                    align={"left"}
                                  >
                                    {" "}
                                    Median cycle time
                                  </Typography>
                                </Grid>
                                <Grid item xs={7}>
                                  <Typography align={"left"}> {entry.name}</Typography>
                                  <Typography align={"left"}>
                                    {formatCurrency(entry.median_execution_cost)}
                                    {item.ave_cost > entry.median_execution_cost ? (
                                      <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
                                    ) : (
                                      <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
                                    )}
                                  </Typography>
                                  <Typography align={"left"}>
                                    {" "}
                                    {formatSeconds(entry.median_cycle_time)}
                                    {item.ave_time > entry.median_cycle_time ? (
                                      <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
                                    ) : (
                                      <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
                                    )}
                                  </Typography>
                                </Grid>
                                <Button
                                  sx={{
                                    marginTop: 1,
                                    marginRight: 1,
                                  }}
                                  type="button"
                                  variant="contained"
                                  onClick={(_e) => {
                                    onDownloadEntrySimParams(entry.sim_params);
                                  }}
                                >
                                  Download parameters
                                </Button>
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

                                <Button
                                  sx={{
                                    marginTop: 1,
                                  }}
                                  type="button"
                                  variant="contained"
                                  onClick={(_e) => {
                                    onDownloadEntryConsParams(entry.cons_params);
                                  }}
                                >
                                  Download constraints
                                </Button>
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
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>
                      {/* })} */}
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
};

export default OptimizationResults;
