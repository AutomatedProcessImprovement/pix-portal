import { Button, ButtonGroup, Grid, Paper, Typography } from "@mui/material";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { WeekView } from "~/components/optimos/WeekView";
import { formatCurrency, formatSeconds, formatPercentage } from "~/shared/num_helper";
import type { FinalSolutionMetric, SolutionJson } from "~/shared/optimos_json_type";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";

interface OptimosSolutionProps {
  solution: SolutionJson;
  finalMetrics?: FinalSolutionMetric;
}

export const OptimosSolution: FC<OptimosSolutionProps> = ({ finalMetrics, solution }) => {
  const resources = Object.values(solution.resources_info).slice(0, 2);

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
            {finalMetrics &&
              (finalMetrics.ave_cost > solution.solution_space.median_execution_cost ? (
                <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
              ) : (
                <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
              ))}
          </Typography>
          <Typography align={"left"}>
            {formatSeconds(solution.solution_space.median_cycle_time)}
            {finalMetrics &&
              (finalMetrics.ave_time > solution.solution_space.median_cycle_time ? (
                <i style={{ color: "green", fontSize: "0.8em" }}> (≤ avg.)</i>
              ) : (
                <i style={{ color: "red", fontSize: "0.8em" }}> ({">"} avg.)</i>
              ))}
          </Typography>
          <Typography align={"left"}>
            {formatPercentage(
              Object.values(solution.resources_info).reduce((acc, resource) => acc + resource.resource_utilization, 0) /
                Object.keys(solution.resources_info).length
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
      <Grid>
        <Typography variant="h6" align="left">
          Resources
        </Typography>
      </Grid>
      <Grid>
        {resources.map((resource, index) => {
          const calendar = solution.sim_params.resource_calendars.find(
            (c) => c.id === resource.resource_name + "timetable"
          );
          const resource_constraints = solution.cons_params.resources.find(
            (r) => r.id === resource.resource_name + "timetable"
          );
          const neverWorkTimes = resource_constraints?.constraints.never_work_masks ?? [];
          const alwaysWorkTimes = resource_constraints?.constraints.always_work_masks ?? [];
          const resource_calendar_entries = {
            calendar: calendar?.time_periods ?? [],
            neverWorkTimes: neverWorkTimes,
            alwaysWorkTimes: alwaysWorkTimes,
          };
          console.log(resource_calendar_entries, resource.resource_name);
          return (
            <Grid container key={`resource-${index}`} direction={"column"}>
              <Grid item>
                <Typography
                  sx={{
                    fontWeight: "bold",
                  }}
                  align={"left"}
                >
                  {resource.resource_name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography align={"left"}>{resource.resource_count} units</Typography>
              </Grid>
              <Grid item>
                <Typography align={"left"}>{formatPercentage(resource.resource_utilization)} Utilization</Typography>
              </Grid>
              <WeekView
                entries={resource_calendar_entries}
                columnColors={{
                  calendar: "lightgreen",
                  neverWorkTimes: "lightcoral",
                  alwaysWorkTimes: "lightblue",
                }}
              ></WeekView>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};
