import { ResourceSelection } from "./ResourceSelection";
import { Grid, Typography } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";

import type { ConsParams } from "~/shared/optimos_json_type";
import { ResourceConstraintsList } from "./ResourceConstraintsList";

interface ResourceCalendarsProps {
  constraintsForm: UseFormReturn<ConsParams, object>;
  setErrorMessage: (value: string) => void;
}

const ResourceConstraints = (props: ResourceCalendarsProps) => {
  const {
    constraintsForm: { watch },
    constraintsForm,
    setErrorMessage,
  } = props;
  const [currCalendarIndex, setCurrCalendarIndex] = useState<number>();
  const [currCalendarKey, setCurrCalendarKey] = useState<string>("");

  const resources = useWatch({ control: constraintsForm.control, name: "resources" });
  const updateCurrCalendar = (index?: number) => {
    // update index
    setCurrCalendarIndex(index);

    // update key
    updateCurrKey(index);
  };

  const updateCurrKey = useCallback(
    (currIndex?: number) => {
      if (currIndex === undefined) {
        setCurrCalendarKey("");
      } else {
        const calendarKey = resources[currIndex]?.id || "";
        setCurrCalendarKey(calendarKey);
      }
    },
    [resources]
  );

  useEffect(() => {
    // once we get the new number of calendars, we:
    // either created a new one and redirect users to this newly created resource
    // or loading the page for the first time and select the first calendar of the list as an active one
    setCurrCalendarIndex(0);
  }, [resources]);

  useEffect(() => {
    // once index of the selected calendar changed,
    // we need to update the key accordingly
    updateCurrKey(currCalendarIndex);
  }, [currCalendarIndex, updateCurrKey]);

  return (
    <Grid container width="100%" spacing={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ResourceSelection
            currCalendarIndex={currCalendarIndex ?? 0}
            constraintsForm={constraintsForm}
            updateCurrCalendar={updateCurrCalendar}
          />
        </Grid>
      </Grid>
      {currCalendarIndex === undefined ? (
        <Grid item xs={12} sx={{ p: 2 }}>
          <Typography>Please select the resource to see its configuration</Typography>
        </Grid>
      ) : (
        <Grid item xs={12} sx={{ p: 2 }}>
          <ResourceConstraintsList
            key={`resource_calendars.${currCalendarKey}`}
            constraintsForm={constraintsForm}
            setErrorMessage={setErrorMessage}
            calendarIndex={currCalendarIndex}
            calendarKey={currCalendarKey}
          />
        </Grid>
      )}
    </Grid>
  );
};

export interface RConsGlobalProps extends ResourceCalendarsProps {
  calendarIndex: number;
  calendarKey: string;
}

export default ResourceConstraints;
