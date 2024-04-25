import { useState, type FC, useRef, useEffect } from "react";
import { type Control, Controller, useWatch, UseFormReturn } from "react-hook-form";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { REQUIRED_ERROR_MSG, SHOULD_BE_GREATER_0_MSG } from "../validationMessages";
import { Start as StartIcon, LastPage as LastPageIcon, BorderColor } from "@mui/icons-material";
import type { ConsParams } from "~/shared/optimos_json_type";
import Selecto from "react-selecto";
import { BLANK_CONSTRAINTS, bitmaskToSelectionIndexes } from "../helpers";

const COLUMNS = ["never_work_masks", "always_work_masks"] as const;
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
// Generate an array of 24 hours
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  constraintsForm: UseFormReturn<ConsParams, object>;
  index: number;
}
export const ConstraintMaskInput: FC<Props> = (props) => {
  const { constraintsForm, index } = props;
  const selectoRef = useRef<Selecto | null>(null);

  const containerClass = `constraints-input`;

  const constraints = useWatch({ control: constraintsForm.control, name: `resources.${index}.constraints` });

  useEffect(() => {
    // Finds the selected element by data-column, data-day and data-index
    const targets = document.querySelectorAll<HTMLElement>(`.${containerClass} .element`);
    const selectedTargets = Array.from(targets.values()).filter((element) => {
      const index = parseInt(element.dataset.index!);
      const column = element.dataset.column as (typeof COLUMNS)[number];
      const day = element.dataset.day as (typeof DAYS)[number];
      return (constraints?.[column]?.[day] ?? 0) & (1 << index);
    });
    selectoRef.current?.setSelectedTargets(selectedTargets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints.always_work_masks, constraints.never_work_masks]);

  const onSelectChange = (selection: Array<HTMLElement | SVGElement>, triggerSelecto = false) => {
    if (triggerSelecto) selectoRef.current?.setSelectedTargets(selection);

    const constraintsEntries = selection.map((element) => {
      const index = parseInt(element.dataset.index!);
      const column = element.dataset.column as (typeof COLUMNS)[number];
      const day = element.dataset.day as (typeof DAYS)[number];
      return { index, column, day };
    });

    // Group by column, then day
    const newConstraints = constraintsEntries.reduce(
      (acc, { index, column, day }) => {
        return {
          ...acc,
          [column]: { ...acc[column], [day]: acc[column]?.[day] | (1 << index) },
        };
      },
      { ...BLANK_CONSTRAINTS }
    );
    constraintsForm.setValue(`resources.${index}.constraints`, { ...constraints, ...newConstraints });
  };
  return (
    <Grid item xs={12} className={containerClass}>
      <Selecto
        ref={selectoRef}
        dragContainer={`.${containerClass}`}
        selectableTargets={[`.${containerClass} .element`]}
        hitRate={20}
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
              <ConstraintDay key={`constraint-day-${day}`} day={day} constraints={constraints} />
            ))}
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

type ConstraintDayProps = {
  day: (typeof DAYS)[number];
  constraints: ConsParams["resources"][0]["constraints"];
};
export const ConstraintDay: FC<ConstraintDayProps> = ({ day, constraints }) => {
  const dayIndex = DAYS.indexOf(day);
  return (
    <Grid item xs borderLeft={1} borderColor={"grey"}>
      <Grid container direction={"row"}>
        {COLUMNS.map((column) => {
          const selectedIndexes = bitmaskToSelectionIndexes(constraints?.[column]?.[day] ?? 0);
          return (
            <Grid item key={`column-${day}-${column}`} xs={6}>
              <Grid container direction="column">
                {HOURS.map((hour, hourIndex) => {
                  const hasEvent = selectedIndexes.includes(hourIndex);
                  return (
                    <Grid
                      className="element"
                      data-column={column}
                      data-index={hourIndex}
                      data-day={day}
                      item
                      key={`event-${day}-${hourIndex}-${column}`}
                    >
                      <Box
                        style={
                          hasEvent
                            ? { backgroundColor: column === "never_work_masks" ? "rgb(242, 107, 44,0.5)" : "lightblue" }
                            : { borderColor: "grey.300" }
                        }
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
        })}
      </Grid>
    </Grid>
  );
};
