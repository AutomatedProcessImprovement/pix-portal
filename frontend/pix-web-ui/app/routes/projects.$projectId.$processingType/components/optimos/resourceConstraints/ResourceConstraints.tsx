import { ResourceSelection } from "./ResourceSelection";
import { Grid, Typography } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useFieldArray, useFormContext, useWatch, type UseFormReturn } from "react-hook-form";

import type { ConsParams } from "~/shared/optimos_json_type";
import { ResourceConstraintsList } from "./ResourceConstraintsList";
import type { MasterFormData } from "../hooks/useMasterFormData";

interface ResourceCalendarsProps {}

const ResourceConstraints = (props: ResourceCalendarsProps) => {
  const form = useFormContext<MasterFormData>();
  const [currCalendarIndex, setCurrCalendarIndex] = useState<number>();
  const [currCalendarKey, setCurrCalendarKey] = useState<string>("");

  const resources = useWatch({ control: form.control, name: "constraints.resources" });
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
          <ResourceSelection currCalendarIndex={currCalendarIndex ?? 0} updateCurrCalendar={updateCurrCalendar} />
        </Grid>
      </Grid>
      {currCalendarIndex === undefined ? (
        <Grid item xs={12} sx={{ p: 2 }}>
          <Typography>Please select the resource to see its configuration</Typography>
        </Grid>
      ) : (
        <Grid item xs={12} sx={{ p: 2 }}>
          <ResourceConstraintsList key={`resource_calendars.${currCalendarKey}`} calendarIndex={currCalendarIndex} />
        </Grid>
      )}
    </Grid>
  );
};

export default ResourceConstraints;
