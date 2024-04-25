import { Card, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { REQUIRED_ERROR_MSG, SHOULD_BE_GREATER_0_MSG } from "../validationMessages";
import { ConstraintMaskInput } from "./ConstraintMaskInput";

import type { MasterFormData } from "../hooks/useMasterFormData";

type ResourceConstraintsListProps = {
  calendarIndex: number;
};

export const ResourceConstraintsList: FC<ResourceConstraintsListProps> = (props) => {
  const { calendarIndex } = props;
  const { control } = useFormContext<MasterFormData>();

  const [index, setIndex] = useState<number>(calendarIndex);

  useEffect(() => {
    if (index !== calendarIndex) {
      setIndex(calendarIndex);
    }
  }, [calendarIndex, index]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={5} sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" align="left">
                Resource constraints
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name={`constraints.resources.${index}.constraints.global_constraints.max_weekly_cap`}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    type="number"
                    value={value}
                    label="Max weekly shifts"
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                    inputProps={{
                      step: "1",
                      min: "1",
                    }}
                    // error={errors?.max_shift_blocks !== undefined}
                    // helperText={errors?.max_shift_blocks?.message || ""}
                    variant="standard"
                    style={{ width: "50%" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name={`constraints.resources.${index}.constraints.global_constraints.max_daily_cap`}
                control={control}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    type="number"
                    value={value}
                    label="Max daily capacity"
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                    inputProps={{
                      step: "1",
                      min: "1",
                    }}
                    // error={errors?.max_shift_blocks !== undefined}
                    // helperText={errors?.max_shift_blocks?.message || ""}
                    variant="standard"
                    style={{ width: "50%" }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name={`constraints.resources.${index}.constraints.global_constraints.max_consecutive_cap`}
                control={control}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    type="number"
                    value={value}
                    label="Max consecutive capacity"
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                    inputProps={{
                      step: "1",
                      min: "1",
                    }}
                    // error={errors?.max_shift_blocks !== undefined}
                    // helperText={errors?.max_shift_blocks?.message || ""}
                    variant="standard"
                    style={{ width: "50%" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name={`constraints.resources.${index}.constraints.global_constraints.max_shifts_day`}
                control={control}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    type="number"
                    value={value}
                    label="Max shifts per day"
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                    inputProps={{
                      step: "1",
                      min: "1",
                    }}
                    // error={errors?.max_shift_blocks !== undefined}
                    // helperText={errors?.max_shift_blocks?.message || ""}
                    variant="standard"
                    style={{ width: "50%" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name={`constraints.resources.${index}.constraints.global_constraints.max_shifts_week`}
                control={control}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    type="number"
                    value={value}
                    label="Max shifts per week"
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                    inputProps={{
                      step: "1",
                      min: "1",
                    }}
                    // error={errors?.max_shift_blocks !== undefined}
                    // helperText={errors?.max_shift_blocks?.message || ""}
                    variant="standard"
                    style={{ width: "50%" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name={`constraints.resources.${index}.constraints.global_constraints.is_human`}
                control={control}
                rules={{
                  required: REQUIRED_ERROR_MSG,
                  min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => {
                            onChange(Boolean(e.target.checked));
                          }}
                        />
                      }
                      label={"Human resource?"}
                    />
                  </>
                )}
              />
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <ConstraintMaskInput index={index} />
      </Grid>
    </Grid>
  );
};
