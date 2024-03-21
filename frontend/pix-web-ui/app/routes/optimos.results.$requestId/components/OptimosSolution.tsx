import { Button, ButtonGroup, Grid, Paper, Typography } from "@mui/material";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { WeekView } from "~/components/optimos/WeekView";
import { formatCurrency, formatSeconds, formatPercentage } from "~/shared/num_helper";
import type { FinalSolutionMetric, Solution } from "~/shared/optimos_json_type";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";
import { ResourcesTable } from "./ResourcesTable";

interface OptimosSolutionProps {
  solution: Solution;
  finalMetrics?: FinalSolutionMetric;
}

export const OptimosSolution: FC<OptimosSolutionProps> = ({ finalMetrics, solution }) => {
  const info = solution.solution_info;
  const resources = Object.values(info.pools_info.pools);

  const link2DownloadRef = useRef<HTMLAnchorElement>(null);
  const link3DownloadRef = useRef<HTMLAnchorElement>(null);

  const [fileDownloadSimParams, setFileDownloadSimParams] = useState("");
  const [fileDownloadConsParams, setFileDownloadConsParams] = useState("");

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

  return (
    <Paper elevation={5} sx={{ m: 3, p: 3, minHeight: "10vw" }}>
      <Grid container alignItems={"center"} justifyContent={"center"} height={"4em"}>
        <Grid item xs={8}>
          <Typography variant="h6" align="left">
            Variant #{info.pools_info.id}
          </Typography>
        </Grid>
        <Grid item xs={4}>
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
          <Grid item xs={12}>
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
            {formatCurrency(info.total_pool_cost)}
            {finalMetrics &&
              (finalMetrics.ave_cost > info.total_pool_cost ? (
                <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
              ) : (
                <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
              ))}
          </Typography>
          <Typography align={"left"}>
            {formatSeconds(info.mean_process_cycle_time)}
            {finalMetrics &&
              (finalMetrics.ave_time > info.mean_process_cycle_time ? (
                <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
              ) : (
                <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
              ))}
          </Typography>
          <Typography align={"left"}>
            {formatPercentage(
              Object.values(info.pool_utilization).reduce((acc, ut) => acc + ut, 0) /
                Object.keys(info.pool_utilization).length
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid>
        <Typography variant="h6" align="left">
          Resources
        </Typography>
      </Grid>
      <Grid>
        <ResourcesTable resources={resources} solutionInfo={info} />
      </Grid>
    </Paper>
  );
};
