import React, { FC, useState } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import Selecto from "react-selecto";
import { ConstraintWorkMask, Resource, Shift, TimePeriod } from "~/shared/optimos_json_type";

export type WeekViewProps = {
  entries: Record<string, TimePeriod[] | Shift | ConstraintWorkMask>;
  columnColors: Record<string, string>;
  columnIndices?: Record<string, number>;
};

export type InternalEntry = {
  day: string;
  hour: number;
  color?: string;
  column: number;
};

const convertToInternalEntries = (
  entries: WeekViewProps["entries"],
  columnColors: WeekViewProps["columnColors"],
  columns: WeekViewProps["columnIndices"]
) => {
  const internalEntries: InternalEntry[] = [];
  for (const [name, timePeriods] of Object.entries(entries)) {
    if (Array.isArray(timePeriods)) {
      for (const timePeriod of timePeriods) {
        const day = timePeriod.from;
        const from = parseInt(timePeriod.beginTime.split(":")[0]);
        const to = parseInt(timePeriod.endTime.split(":")[0]);
        for (let hour = from; hour < to; hour++) {
          internalEntries.push({ day, hour, color: columnColors[name], column: columns?.[name] ?? 0 });
        }
      }
    } else {
      for (const [day, workMask] of Object.entries(timePeriods)) {
        workMask
          .toString(2)
          .padStart(24, "0")
          .split("")
          .forEach((value: string, index: number) => {
            if (value === "1") {
              internalEntries.push({ day, hour: index, color: columnColors[name], column: columns?.[name] ?? 0 });
            }
          });
      }
    }
  }
  return internalEntries;
};

const isTimePeriodInHour = (timePeriod: TimePeriod, hour: number) => {
  const from = parseInt(timePeriod.beginTime.split(":")[0]);
  const to = parseInt(timePeriod.endTime.split(":")[0]);
  return hour >= from && hour < to;
};

const isTimePeriodInDay = (timePeriod: TimePeriod, day: string) => {
  return timePeriod.from.toLocaleLowerCase() === day.toLocaleLowerCase();
};

const isDayHourInWorkMask = (day: string, hour: number, workMask: ConstraintWorkMask) =>
  (workMask[day.toLocaleLowerCase() as keyof ConstraintWorkMask] >>> 0).toString(2).padStart(24, "0")[hour] === "1";

export const WeekView: FC<WeekViewProps> = (props) => {
  const columnCount = Math.max(...Object.values(props.columnIndices ?? {}), 0);

  const [selectedCells, setSelectedCells] = useState<any>([]);

  // Generate an array of 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate an array of days starting from Monday to Sunday
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Function to handle cell selection
  const handleSelect = (event: any) => {
    const selected = Array.from(event.selected);
    setSelectedCells(selected);
  };

  const internalEntries = convertToInternalEntries(props.entries, props.columnColors, props.columnIndices);

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={1} />

        {/* Days headers */}
        {days.map((day, index) => (
          <Grid item xs key={index}>
            <Typography align="center" variant="h6">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Grid container>
        {/* Time column */}
        <Grid item xs={1}>
          {hours.map((hour) => (
            <Box key={hour} textAlign="center" height={20}>
              <Typography variant="body2">{`${hour}:00`}</Typography>
            </Box>
          ))}
        </Grid>
        {/* Days events */}
        {days.map((day, dayIndex) => (
          <Grid item xs key={dayIndex}>
            <Grid container direction="column" key={`column-${day}`}>
              {hours.map((hour, hourIndex) => (
                <Grid container direction={"row"} key={`hour-${day}-${hourIndex}`} px={1}>
                  {Array.from({ length: columnCount + 1 }, (_, i) => i).map((columnIndex) => {
                    const entry = internalEntries.find(
                      (entry) =>
                        entry.day.toLocaleLowerCase() === day.toLocaleLowerCase() &&
                        entry.hour === hour &&
                        entry.column === columnIndex
                    );
                    const hasEvent = entry !== undefined;
                    const eventColor = entry?.color;
                    return (
                      <Grid item key={`event-${day}-${hourIndex}-${columnIndex}`} style={{ flex: hasEvent ? 1 : 0 }}>
                        <Box
                          bgcolor={
                            hasEvent
                              ? eventColor
                              : selectedCells.includes(`${dayIndex}-${hourIndex}`)
                              ? "#c0c0c0"
                              : "transparent"
                          }
                          borderBottom={1}
                          borderColor="grey.300"
                          height={20}
                        ></Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
      {/* Selecto for creating new events */}
    </Box>
  );
};
