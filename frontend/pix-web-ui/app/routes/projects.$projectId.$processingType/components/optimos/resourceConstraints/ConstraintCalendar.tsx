import { Grid, Box, Typography, Divider } from "@mui/material";
import type { FC } from "react";
import { useRef, useEffect } from "react";
import Selecto from "react-selecto";
import type { ConstraintWorkMask } from "~/shared/optimos_json_type";
import { bitmaskToSelectionIndexes } from "../helpers";

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
// Generate an array of 24 hours
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

type ConstraintCalendarProps = {
  workMask: ConstraintWorkMask;
  prefix: string;
  color: string;
  onSelectChange: (selection: Array<HTMLElement | SVGElement>) => void;
};

export const ConstraintCalendar: FC<ConstraintCalendarProps> = ({ prefix, onSelectChange, workMask, color }) => {
  const selectoRef = useRef<Selecto | null>(null);

  const containerClassName = `${prefix}-container`;
  useEffect(() => {
    // Finds the selected element by data-column, data-day and data-index
    const targets = document.querySelectorAll<HTMLElement>(`.${containerClassName} .element`);
    const selectedTargets = Array.from(targets.values()).filter((element) => {
      const index = parseInt(element.dataset.index!);

      const day = element.dataset.day as (typeof DAYS)[number];
      return (workMask?.[day] ?? 0) & (1 << index);
    });
    selectoRef.current?.setSelectedTargets(selectedTargets);
  }, [containerClassName, selectoRef, workMask]);
  return (
    <Grid item xs={12} className={containerClassName}>
      <Selecto
        ref={selectoRef}
        dragContainer={`.${containerClassName}`}
        selectableTargets={[`.${containerClassName} .element`]}
        hitRate={0}
        selectFromInside={true}
        selectByClick={true}
        continueSelect={true}
        onSelect={(e) => onSelectChange(e.selected)}
      />

      <Box>
        <Grid container spacing={1}>
          <Grid item xs={2} />

          {/* Days headers */}
          {DAYS.map((day, index) => (
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
          <Grid item xs={2}>
            {HOURS.map((hour) => (
              <Grid
                height={30}
                key={`hour-label-${hour}`}
                container
                direction={"row"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {/* <IconButton size="small">
                          <StartIcon />
                        </IconButton>
                        <IconButton size="small">
                          <LastPageIcon />
                        </IconButton> */}
                <Box key={hour} textAlign="center">
                  <Typography variant="body2">{`${hour}:00`}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {/* Days events */}
          <Grid container item direction={"row"} xs>
            {DAYS.map((day, dayIndex) => (
              <ConstraintDay
                color={color}
                key={`constraint-day-${day}`}
                day={day}
                workMask={workMask}
                prefix={prefix}
              />
            ))}
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

type ConstraintDayProps = {
  day: (typeof DAYS)[number];
  workMask: ConstraintWorkMask;
  prefix: string;
  color: string;
};
export const ConstraintDay: FC<ConstraintDayProps> = ({ day, workMask, prefix, color }) => {
  const selectedIndexes = bitmaskToSelectionIndexes(workMask?.[day] ?? 0);
  return (
    <Grid item xs borderLeft={1} borderColor={"grey"}>
      <Grid container direction={"column"}>
        {HOURS.map((hour, hourIndex) => {
          const hasEvent = selectedIndexes.includes(hourIndex);
          return (
            <Grid className="element" data-index={hourIndex} data-day={day} item key={`event-${day}-${hourIndex}`}>
              <Box
                style={hasEvent ? { backgroundColor: color } : { borderColor: "grey.300" }}
                borderBottom={1}
                borderColor="grey.300"
                width={"100%"}
                height={30}
              ></Box>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};
