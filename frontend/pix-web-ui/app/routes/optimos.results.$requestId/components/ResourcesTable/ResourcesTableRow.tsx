import { TableRow, TableCell, IconButton, Chip, Collapse, Box, Typography, Grid } from "@mui/material";
import type { FC } from "react";
import React, { useState } from "react";
import { WeekView } from "~/components/optimos/WeekView";
import type { EnhancedResource, Shift, ConstraintWorkMask } from "~/shared/optimos_json_type";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FiberNew as FiberNewIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { COLUMN_DEFINITIONS } from "./ResourcesTableColumnDefinitions";
import { ResourcesTableCell } from "./ResourcesTableCell";

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

export const ResourceTableRow: FC<ResourceRowProps> = React.memo((props) => {
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
          {!is_deleted && !is_duplicate && !are_tasks_different && !are_shifts_different && (
            <Chip label="Unchanged" color="default" variant="outlined" />
          )}
        </TableCell>
        {COLUMN_DEFINITIONS.map((column) => (
          <ResourcesTableCell key={column.id} column={column} resource={resource} />
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
                    <span style={{ color: "rgb(242, 107, 44, 0.5)" }}>Never Work Time</span>
                    <span style={{ color: "lightblue" }}>Always Work Time</span>
                    <span style={{ color: "darkgrey" }}>Unchanged Working Time</span>
                    <span style={{ color: "rgb(248,248,248))" }}>Removed Work Time</span>
                    <span style={{ color: "rgb(34,139,34,0.7)" }}>Added Work Time</span>
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
