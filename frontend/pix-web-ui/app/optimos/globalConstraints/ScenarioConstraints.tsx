/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Controller, type UseFormReturn } from "react-hook-form";
import { type ConsJsonData, type ScenarioProperties } from "../../JsonData";
import { Card, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { REQUIRED_ERROR_MSG, SHOULD_BE_GREATER_0_MSG } from "../validationMessages";
import { useState } from "react";

interface ScenarioConstraintsProps {
  scenarioFormState: UseFormReturn<ScenarioProperties, object>;
  jsonFormState: UseFormReturn<ConsJsonData, object>;
  setErrorMessage: (value: string) => void;
}

const ScenarioConstraints = (props: ScenarioConstraintsProps) => {
  const {
    control: consFormControl,
    formState: { errors },
  } = props.jsonFormState;
  const [timevar, setTimevar] = useState<number>(60);

  return (
    <>
      <Card elevation={5} sx={{ p: 2, width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" align="left">
              Global scenario constraints
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="max_cap"
              control={consFormControl}
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
                  label="Maximum capacity"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  inputProps={{
                    step: "1",
                    min: "1",
                  }}
                  error={errors?.max_cap !== undefined}
                  helperText={errors?.max_cap?.message ?? ""}
                  variant="standard"
                  style={{ width: "50%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="max_shift_size"
              control={consFormControl}
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
                  label="Max shift size"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  inputProps={{
                    step: "1",
                    min: "1",
                    max: 1440 / timevar,
                  }}
                  error={errors?.max_shift_size !== undefined}
                  helperText={errors?.max_shift_size?.message ?? ""}
                  variant="standard"
                  style={{ width: "50%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="max_shift_blocks"
              control={consFormControl}
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
                  label="Max shifts / day"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  inputProps={{
                    step: "1",
                    min: "1",
                    max: 1440 / timevar,
                  }}
                  error={errors?.max_shift_blocks !== undefined}
                  helperText={errors?.max_shift_blocks?.message ?? ""}
                  variant="standard"
                  style={{ width: "50%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="hours_in_day"
              control={consFormControl}
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
                  label="Hours per day (NOT IN USE)"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  inputProps={{
                    step: "1",
                    min: "1",
                  }}
                  error={errors?.hours_in_day !== undefined}
                  helperText={errors?.hours_in_day?.message ?? ""}
                  variant="standard"
                  style={{ width: "50%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="time_var"
              control={consFormControl}
              rules={{
                required: REQUIRED_ERROR_MSG,
                min: {
                  value: 1,
                  message: SHOULD_BE_GREATER_0_MSG,
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputLabel id={"algorithm-select-label"}>Time Granularity</InputLabel>
                  <Select
                    required={true}
                    name={"algorithm"}
                    sx={{ minWidth: 250 }}
                    labelId="algorithm-select-label"
                    id="approach-select"
                    value={value}
                    label="Algorithm"
                    onChange={(e) => {
                      onChange(String(e.target.value));
                      setTimevar(Number(e.target.value));
                    }}
                    style={{ width: "50%" }}
                    error={errors?.time_var !== undefined}
                    variant="standard"
                  >
                    <MenuItem disabled value={"15"}>
                      15
                    </MenuItem>
                    <MenuItem disabled value={"30"}>
                      30
                    </MenuItem>
                    <MenuItem value={"60"}>60</MenuItem>
                  </Select>
                </>
              )}
            />
          </Grid>
        </Grid>
      </Card>
    </>
  );
};

export default ScenarioConstraints;
