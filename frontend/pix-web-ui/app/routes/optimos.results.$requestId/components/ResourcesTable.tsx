import {
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import type { FC, ReactNode } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FiberNew as FiberNewIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import type {
  ConstraintWorkMask,
  EnhancedResource,
  Resource,
  Shift,
  Solution,
  SolutionInfo,
} from "~/shared/optimos_json_type";
import { formatCurrency, formatHourlyRate, formatHours, formatPercentage, formatSeconds } from "~/shared/num_helper";
import { WeekView } from "~/components/optimos/WeekView";
import {
  createInitialResourceStats,
  getBaseName,
  getInitialResourceByName,
  useInitialEnhancedResourceByName,
  useInitialSolution,
} from "./InitialSolutionContext";
import { visuallyHidden } from "@mui/utils";

type OrderByField = keyof Omit<EnhancedResource, "initial_resource"> | "has_changes";
type Order = "asc" | "desc";
const COLUMN_DEFINITIONS: {
  id: keyof Omit<EnhancedResource, "initial_resource">;
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

const ResourceRow: FC<ResourceRowProps> = React.memo((props) => {
  const { resource } = props;
  const [open, setOpen] = useState(false);

  const {
    is_deleted,
    is_duplicate,
    are_tasks_different,
    are_shifts_different,
    initial_resource,
    old_tasks,
    new_tasks,
    removed_tasks,
    never_work_masks,
    always_work_masks,
  } = resource;
  const resource_calendar_entries = {
    ...getShifts(initial_resource?.shifts[0], resource.shifts[0]),
    neverWorkTimes: never_work_masks,
    alwaysWorkTimes: always_work_masks,
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
          {is_deleted && <Chip label="Deleted" color="error" variant="outlined" />}
          {!initial_resource && <Chip label="New" color="success" variant="outlined" />}
          {is_duplicate && <Chip icon={<ContentCopyIcon />} label="New" color="success" variant="outlined" />}
          {are_tasks_different && <Chip icon={<FiberNewIcon />} label="Tasks" color="warning" variant="outlined" />}
          {are_shifts_different && <Chip icon={<FiberNewIcon />} label="Shifts" color="warning" variant="outlined" />}
        </TableCell>
        {COLUMN_DEFINITIONS.map(({ id, formatFn, lowerIsBetter }) => (
          <TableCell key={id} align="left">
            {formatFn(resource[id])}
            <br />
            {lowerIsBetter !== undefined &&
              !is_deleted &&
              !resource.is_duplicate &&
              !!initial_resource?.[id] &&
              initial_resource[id] !== resource[id] &&
              (initial_resource[id] < resource[id] ? (
                <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "red" : "green"}>
                  (↑) {formatFn(initial_resource[id])}
                </Typography>
              ) : (
                <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "green" : "red"}>
                  (↓) {formatFn(initial_resource[id])}
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
                {old_tasks.map((name) => (
                  <Grid item key={name}>
                    <Chip label={name} variant="outlined" style={{ color: "grey" }} />
                  </Grid>
                ))}
                {new_tasks.map((name) => (
                  <Grid item key={name}>
                    <Chip label={name} variant="outlined" color="success" />
                  </Grid>
                ))}
                {removed_tasks?.map((name) => (
                  <Grid item key={name}>
                    <Chip label={name} variant="outlined" color="error" />
                  </Grid>
                ))}
              </Grid>
              <br />
              <Typography variant="h6" gutterBottom component="div">
                Calendar
              </Typography>
              <WeekView
                entries={resource_calendar_entries}
                columnStyles={{
                  unchangedShift: { backgroundColor: "darkgrey" },
                  neverWorkTimes: {
                    backgroundColor: "rgb(242, 107, 44,0.5)",
                    borderColor: "rgb(242, 107, 44, 1)",
                    borderWidth: 1,
                    borderStyle: "dashed",
                  },
                  alwaysWorkTimes: { backgroundColor: "lightblue" },
                  onlyInOriginalShift: {
                    backgroundColor: "rgb(248,248,248)",
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
              />
              <Typography variant="caption" fontSize={12} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
                  <Grid container justifyContent={"space-between"} maxWidth={"50vw"}>
                    <strong>Legend:</strong>
                    <span style={{ color: "rgb(242, 107, 44)" }}>Never Work Time</span>
                    <span style={{ color: "lightblue" }}>Always Work Time</span>
                    <span style={{ color: "darkgrey" }}>Unchanged Working Time</span>
                    <span style={{ color: "rgb(232,232,232)" }}>Removed Work Time</span>
                    <span style={{ color: "rgb(34,139,34)" }}>Added Work Time</span>
                  </Grid>
                </Grid>
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

type ResourcesTableProps = {
  resources: Resource[];
  deletedResources: Resource[];
  solutionInfo: SolutionInfo;
};

const orderByHelper = (a: any, b: any, order: Order) => {
  if (a < b) {
    return order === "desc" ? -1 : 1;
  }
  if (a > b) {
    return order === "desc" ? 1 : -1;
  }
  return 0;
};

const getOrderByHasChangesValue = (resource: EnhancedResource) => {
  if (resource.is_deleted) return "1";
  if (resource.is_duplicate) return "2";
  if (resource.are_tasks_different) return "3";
  if (resource.are_shifts_different) return "4";
  return "5";
};

export const ResourcesTable: FC<ResourcesTableProps> = React.memo((props) => {
  const { resources, deletedResources, solutionInfo } = props;
  const initialSolution = useInitialSolution();

  const [orderBy, setOrderBy] = useState<OrderByField>("has_changes");
  const [order, setOrder] = useState<Order>("desc");
  const resourceToEnhancedResource = createEnhancedResourceMappingFunction(
    solutionInfo,
    resources,
    deletedResources,
    initialSolution
  );
  const [sortedResources, setSortedResources] = useState<EnhancedResource[]>(
    [...resources, ...deletedResources].map(resourceToEnhancedResource)
  );

  useEffect(() => {
    console.log("Sort resources by", orderBy, order);
    setSortedResources(
      [...sortedResources].sort((a, b) => {
        if (orderBy === "has_changes") {
          return orderByHelper(getOrderByHasChangesValue(a), getOrderByHasChangesValue(b), order);
        }
        return orderByHelper(a[orderBy], b[orderBy], order);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy]);

  const onSortingClick = useCallback(
    (columnId: OrderByField) => {
      if (orderBy !== columnId) {
        setOrder("desc");
        setOrderBy(columnId);
      } else {
        setOrder(order === "asc" ? "desc" : "asc");
      }
    },
    [orderBy, order]
  );

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <TableSortLabel
                active={orderBy === "has_changes"}
                direction={orderBy === "has_changes" ? order : "desc"}
                onClick={() => onSortingClick("has_changes")}
              >
                Status
                {orderBy === "has_changes" ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
            {COLUMN_DEFINITIONS.map((column) => (
              <TableCell
                key={column.id}
                align="left"
                style={{ minWidth: column.minWidth }}
                sortDirection={orderBy === column.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "desc"}
                  onClick={() => onSortingClick(column.id)}
                >
                  {column.label}
                  {orderBy === column.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc" ? "sorted descending" : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

const areShiftsDifferent = (resource: Resource, initialResource?: Resource | null) =>
  JSON.stringify({ ...resource.shifts[0], resource_id: "" }) !==
  JSON.stringify({ ...initialResource?.shifts[0], resource_id: "" });

const splitTasks = (currentTasks: string[], initialTasks?: string[]) => {
  const newTasks = currentTasks.filter((task) => !initialTasks?.includes(task));
  const removedTasks = initialTasks?.filter((task) => !currentTasks.includes(task));
  const oldTasks = currentTasks.filter((task) => initialTasks?.includes(task));
  return { newTasks, oldTasks, removedTasks };
};

const createEnhancedResourceMappingFunction = (
  solutionInfo: SolutionInfo,
  resources: Resource[],
  deletedResources: Resource[],
  initialSolution: Solution
) => {
  const {
    pool_utilization,
    pool_time,
    pool_cost,
    available_time,
    pools_info: { task_allocations, task_pools },
  } = solutionInfo;

  return (resource: Resource): EnhancedResource => {
    const tasks =
      task_allocations[resource.id]?.map((taskIndex) => {
        return Object.keys(task_pools)[taskIndex];
      }) ?? [];
    const initialResource = getInitialResourceByName(initialSolution, resource.resource_name);
    const enhancedInitialResource = !initialResource
      ? null
      : {
          ...initialResource,
          ...createInitialResourceStats(initialResource.id, initialSolution),
        };

    const { newTasks, oldTasks, removedTasks } = splitTasks(tasks, enhancedInitialResource?.tasks);
    const isDeleted = deletedResources.some((r) => r.id === resource.id);
    const isDuplicate =
      getBaseName(resource.resource_name) !== resource.resource_name &&
      resources.filter((r) => getBaseName(r.resource_name) === getBaseName(resource.resource_name)).length > 1;

    return {
      ...resource,
      total_worktime: pool_time[resource.id],
      total_cost: pool_cost[resource.id],
      utilization: pool_utilization[resource.id],
      available_time: available_time[resource.id],
      tasks,
      initial_resource: enhancedInitialResource || undefined,
      is_duplicate: isDuplicate,
      is_deleted: isDeleted,
      are_tasks_different: !isDeleted && (newTasks.length > 0 || (removedTasks?.length ?? 0) > 0),
      are_shifts_different: !isDeleted && areShiftsDifferent(resource, initialResource),
      new_tasks: newTasks,
      removed_tasks: removedTasks ?? [],
      old_tasks: oldTasks,
    };
  };
};
