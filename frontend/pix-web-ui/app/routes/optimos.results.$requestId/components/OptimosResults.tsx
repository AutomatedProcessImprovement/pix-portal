import { Button, Grid, Paper, Typography, Box, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import "moment-duration-format";
import type { FullOutputJson } from "~/shared/optimos_json_type";
import { formatCurrency, formatPercentage, formatSeconds } from "~/shared/num_helper";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";
import { WeekView } from "~/components/optimos/WeekView";
import { OptimosSolution } from "./OptimosSolution";

interface SimulationResultsProps {
  report: FullOutputJson;
}

const OptimizationResults = (props: SimulationResultsProps) => {
  const { report: reportJson } = props;
  const [report, setReport] = useState<FullOutputJson | null>();

  const [fileDownloadUrl, setFileDownloadUrl] = useState("");

  const linkDownloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setReport(reportJson);
  }, [reportJson]);

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

  const final_metrics = report?.final_solution_metrics?.[0];

  if (!report) return <div>Loading...</div>;

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
                {!report?.final_solutions && report.current_solution && (
                  <Grid item xs={12}>
                    <OptimosSolution solution={report.current_solution} finalMetrics={final_metrics}></OptimosSolution>
                  </Grid>
                )}
                {report?.final_solutions?.map((solution, index) => {
                  return (
                    <Grid item xs={12} key={`grid-${index}`}>
                      <OptimosSolution key={index} solution={solution} finalMetrics={final_metrics}></OptimosSolution>
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
