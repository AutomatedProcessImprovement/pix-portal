import {
  Box,
  Chip,
  Collapse,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { FC, ReactNode } from "react";
import React, { useState } from "react";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FiberNew as FiberNewIcon,
} from "@mui/icons-material";
import type {
  ConstraintWorkMask,
  EnhancedResource,
  Resource,
  ResourceListItem,
  ResourceStats,
  Shift,
  SolutionInfo,
} from "~/shared/optimos_json_type";
import { formatCurrency, formatHourlyRate, formatHours, formatPercentage, formatSeconds } from "~/shared/num_helper";
import { WeekView } from "~/components/optimos/WeekView";
import { getBaseName, useInitialEnhancedResource, useInitialEnhancedResourceByName } from "./InitialSolutionContext";

const COLUMN_DEFINITIONS: {
  id: keyof EnhancedResource;
  label: string;
  formatFn: (x: any) => ReactNode;
  lowerIsBetter?: boolean;
  minWidth?: string | number;
}[] = [
  { id: "resource_name", label: "Name", formatFn: (x) => x, minWidth: "10em" },
  { id: "total_worktime", label: "Worktime", formatFn: formatSeconds, lowerIsBetter: false, minWidth: "10em" },
  { id: "available_time", label: "Available Time", formatFn: formatHours, lowerIsBetter: true },
  { id: "cost_per_hour", label: "Hourly Rate", formatFn: formatHourlyRate, lowerIsBetter: true },
  { id: "total_cost", label: "Total Cost", formatFn: formatCurrency, lowerIsBetter: true },
  { id: "utilization", label: "Utilization", formatFn: formatPercentage, lowerIsBetter: false },
  { id: "is_human", label: "Type", formatFn: (x) => (x ? "Human" : "Machine") },
  { id: "max_weekly_cap", label: "Max h/week", formatFn: formatHours, lowerIsBetter: false },
  { id: "max_daily_cap", label: "Max h/day", formatFn: formatHours, lowerIsBetter: false },
  { id: "max_consecutive_cap", label: "Max Hours consecutively", formatFn: formatHours, lowerIsBetter: false },
];

type ResourceRowProps = {
  resource: EnhancedResource;
};

const getShifts = (originalShift?: Shift, currentShift?: Shift) => {
  if (!originalShift || !currentShift) return undefined;
  const onlyInOriginalShift: ConstraintWorkMask = {
    ...originalShift,
  };
  const onlyInCurrent: ConstraintWorkMask = {
    ...currentShift,
  };
  const unchangedShift: ConstraintWorkMask = {
    ...currentShift,
  };
  const DAYS: (keyof ConstraintWorkMask)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  for (const day of DAYS) {
    onlyInOriginalShift[day] = (originalShift[day] as number) & ~(currentShift[day] as number);
    onlyInCurrent[day] = (currentShift[day] as number) & ~(originalShift[day] as number);
    unchangedShift[day] = (currentShift[day] as number) & (originalShift[day] as number);
  }
  return { onlyInOriginalShift, onlyInCurrent, unchangedShift };
};

const ResourceRow: FC<ResourceRowProps> = (props) => {
  const { resource } = props;
  const [open, setOpen] = useState(false);

  const initialResource = useInitialEnhancedResourceByName(resource.resource_name);

  const neverWorkTimes = resource.never_work_masks;
  const alwaysWorkTimes = resource.always_work_masks;
  const resource_calendar_entries = {
    ...getShifts(initialResource?.shifts[0], resource.shifts[0]),
    neverWorkTimes: neverWorkTimes,
    alwaysWorkTimes: alwaysWorkTimes,
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {!initialResource && <Chip label="New" color="success" variant="outlined" />}
          {resource.is_duplicate && <Chip label="Duplicate" color="success" variant="outlined" />}
          {areTasksDifferent(resource, initialResource) && (
            <Chip icon={<FiberNewIcon />} label="Tasks" color="warning" variant="outlined" />
          )}
          {areShiftsDifferent(resource, initialResource) && (
            <Chip icon={<FiberNewIcon />} label="Shifts" color="warning" variant="outlined" />
          )}
        </TableCell>
        {COLUMN_DEFINITIONS.map(({ id, formatFn, lowerIsBetter }) => (
          <TableCell key={id} align="left">
            {formatFn(resource[id])}
            <br />
            {lowerIsBetter !== undefined &&
              !!initialResource?.[id] &&
              initialResource[id] !== resource[id] &&
              (initialResource[id] < resource[id] ? (
                <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "red" : "green"}>
                  (↑) {formatFn(initialResource[id])}
                </Typography>
              ) : (
                <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "green" : "red"}>
                  (↓) {formatFn(initialResource[id])}
                </Typography>
              ))}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }} width={"100%"}>
              <Typography variant="h6" gutterBottom component="div">
                Assigned Tasks
              </Typography>
              <Grid container spacing={1}>
                {resource.tasks.map((name) => (
                  <Grid item key={name}>
                    <Chip label={name} variant="outlined" color="primary" />
                  </Grid>
                ))}
              </Grid>
              <br />
              <Typography variant="h6" gutterBottom component="div">
                Calendar
              </Typography>
              <Typography variant="caption" fontSize={12} sx={{ marginTop: 2 }}>
                <Grid item xs={9} justifyContent={"space-evenly"}>
                  <strong>Legend:</strong>
                  <span style={{ color: "darkgrey" }}>Unchanged Working Time</span>
                  <span style={{ color: "rgb(240,128,128)" }}>Never Work Time</span>
                  <span style={{ color: "lightblue" }}>Always Work Time</span>
                  <span style={{ color: "rgb(232,232,232)" }}>Removed Work Time</span>
                  <span style={{ color: "rgb(34,139,34)" }}>Added Work Time</span>
                </Grid>
              </Typography>
              <WeekView
                entries={resource_calendar_entries}
                columnStyles={{
                  unchangedShift: { backgroundColor: "darkgrey" },
                  neverWorkTimes: {
                    backgroundColor: "rgb(240,128,128,0.5)",
                    borderColor: "rgb(240,128,128,1)",
                    borderWidth: 1,
                    borderStyle: "dashed",
                  },
                  alwaysWorkTimes: { backgroundColor: "lightblue" },
                  onlyInOriginalShift: {
                    backgroundColor: "rgb(232,232,232)",
                    borderColor: "rgb(196,196,196)",
                    borderWidth: 1,
                    borderStyle: "dashed",
                  },
                  onlyInCurrent: {
                    backgroundColor: "rgb(34,139,34, 0.7)",
                  },
                }}
                columnIndices={{
                  unchangedShift: 0,
                  neverWorkTimes: 1,
                  alwaysWorkTimes: 1,
                  onlyInOriginalShift: 2,
                  onlyInCurrent: 2,
                }}
              ></WeekView>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

type ResourcesTableProps = {
  resources: Resource[];
  solutionInfo: SolutionInfo;
};

export const ResourcesTable: FC<ResourcesTableProps> = (props) => {
  const {
    resources,
    solutionInfo: {
      pool_utilization,
      pool_time,
      pool_cost,
      available_time,
      pools_info: { task_allocations, task_pools },
    },
  } = props;
  const resourceToEnhancedResource = (resource: Resource): EnhancedResource => ({
    ...resource,
    total_worktime: pool_time[resource.id],
    total_cost: pool_cost[resource.id],
    utilization: pool_utilization[resource.id],
    available_time: available_time[resource.id],
    tasks: task_allocations[resource.id].map((taskIndex) => {
      return Object.keys(task_pools)[taskIndex];
    }),
    is_duplicate:
      getBaseName(resource.resource_name) !== resource.resource_name &&
      resources.filter((r) => getBaseName(r.resource_name) === getBaseName(resource.resource_name)).length > 1,
  });

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            {COLUMN_DEFINITIONS.map((column) => (
              <TableCell key={column.id} align="left" style={{ minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.map((row) => (
            <ResourceRow key={row.id} resource={resourceToEnhancedResource(row)} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const areTasksDifferent = (resource: EnhancedResource, initialResource?: EnhancedResource | null) =>
  resource.tasks.join() !== (initialResource?.tasks ?? []).join();

const areShiftsDifferent = (resource: EnhancedResource, initialResource?: EnhancedResource | null) =>
  JSON.stringify({ ...resource.shifts[0], resource_id: "" }) !==
  JSON.stringify({ ...initialResource?.shifts[0], resource_id: "" });
