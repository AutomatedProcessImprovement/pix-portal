import { ResourceSelection } from "./ResourceSelection";
import { Grid, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

import type { ConsParams } from "~/shared/optimos_json_type";
import { ResourceConstraintsList } from "./ResourceConstraintsList";

interface ResourceCalendarsProps {
  formState: UseFormReturn<ConsParams, object>;
  setErrorMessage: (value: string) => void;
}

const ResourceConstraints = (props: ResourceCalendarsProps) => {
  const {
    formState: { control: formControl },
    formState,
    setErrorMessage,
  } = props;
  const [currCalendarIndex, setCurrCalendarIndex] = useState<number>();
  const [currCalendarKey, setCurrCalendarKey] = useState<string>("");

  const { fields: allCalendars } = useFieldArray({
    keyName: "key",
    control: formControl,
    name: "resources",
  });

  useEffect(() => {
    // once we get the new number of calendars, we:
    // either created a new one and redirect users to this newly created resource
    // or loading the page for the first time and select the first calendar of the list as an active one
    setCurrCalendarIndex(0);
  }, [allCalendars]);

  useEffect(() => {
    // once index of the selected calendar changed,
    // we need to update the key accordingly
    updateCurrKey(currCalendarIndex);
  }, [currCalendarIndex]);

  const handleCalendarSelectChange = (event: any) => {
    const selectedCalendarIndex = event.target.value;
    updateCurrCalendar(Number(selectedCalendarIndex));
  };

  const updateCurrCalendar = (index?: number) => {
    // update index
    setCurrCalendarIndex(index);

    // update key
    updateCurrKey(index);
  };

  const updateCurrKey = (currIndex?: number) => {
    if (currIndex === undefined) {
      setCurrCalendarKey("");
    } else {
      const calendarKey = allCalendars[currIndex]?.key || "";
      setCurrCalendarKey(calendarKey);
    }
  };

  return (
    <Grid container width="100%" spacing={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ResourceSelection
            currCalendarIndex={currCalendarIndex ?? 0}
            formState={formState}
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
            formState={formState}
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
