import React, { FC, useState } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import Selecto from "react-selecto";
import { ConstraintWorkMask, Resource, TimePeriod } from "~/shared/optimos_json_type";

export type WeekViewProps = {
  entries: Record<string, TimePeriod[] | ConstraintWorkMask>;
  columnColors: Record<string, string>;
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
  const columns_per_day = Object.keys(props.entries);

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
            <Grid container direction="column" key={`${day}`}>
              {hours.map((hour, hourIndex) => (
                <Grid container direction={"row"} key={`${day}`}>
                  {columns_per_day.map((column) => {
                    let hasEvent;
                    const eventColor = props.columnColors[column];
                    const columnData = props.entries[column];
                    if (Array.isArray(columnData)) {
                      hasEvent = columnData.some(
                        (timePeriod) => isTimePeriodInHour(timePeriod, hour) && isTimePeriodInDay(timePeriod, day)
                      );
                    } else {
                      hasEvent = isDayHourInWorkMask(day, hour, columnData);
                    }
                    return (
                      <Grid item xs key={hourIndex}>
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
