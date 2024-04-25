import { Controller, type UseFormReturn } from "react-hook-form";
import { Card, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { REQUIRED_ERROR_MSG, SHOULD_BE_GREATER_0_MSG } from "../validationMessages";
import type { ConsParams, ScenarioProperties } from "~/shared/optimos_json_type";

interface GlobalConstraintsProps {
  scenarioFormState: UseFormReturn<ScenarioProperties, object>;
  jsonFormState: UseFormReturn<ConsParams, object>;
  setErrorMessage: (value: string) => void;
}

const GlobalConstraints = (props: GlobalConstraintsProps) => {
  const {
    scenarioFormState: {
      control: scenarioFormControl,
      formState: { errors: scenarioErrors },
    },
  } = props;

  return (
    <>
      <Card elevation={5} sx={{ p: 2, mb: 3, width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" align="left">
              Scenario specification
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="scenario_name"
              control={scenarioFormControl}
              rules={{
                required: REQUIRED_ERROR_MSG,
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  type="text"
                  value={value}
                  label="Scenario name"
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  error={scenarioErrors?.scenario_name !== undefined}
                  helperText={scenarioErrors?.scenario_name?.message ?? ""}
                  variant="standard"
                  style={{ width: "75%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="algorithm"
              control={scenarioFormControl}
              rules={{
                required: REQUIRED_ERROR_MSG,
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputLabel id={"algorithm-select-label"}>Algorithm</InputLabel>
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
                    }}
                    error={scenarioErrors?.algorithm !== undefined}
                    variant="standard"
                  >
                    <MenuItem value={"HC-STRICT"}>HC-STRICT | Hill Climb strict</MenuItem>
                    <MenuItem value={"HC-FLEX"}>HC-FLEX | Hill Climb flex</MenuItem>
                    <MenuItem value={"TS"}>TS | Tabu search </MenuItem>
                    <MenuItem value={"ALL"}>ALL | All algorithms </MenuItem>
                  </Select>
                </>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="num_iterations"
              control={scenarioFormControl}
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
                  label="Total number of iterations"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  inputProps={{
                    step: "1",
                    min: "1",
                  }}
                  error={scenarioErrors?.num_iterations !== undefined}
                  helperText={scenarioErrors?.num_iterations?.message ?? ""}
                  variant="standard"
                  style={{ width: "75%" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="approach"
              control={scenarioFormControl}
              rules={{
                required: REQUIRED_ERROR_MSG,
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputLabel id="approach-select-label">Approach</InputLabel>
                  <Select
                    required={true}
                    sx={{ minWidth: 250 }}
                    labelId="approach-select-label"
                    id="approach-select"
                    value={value}
                    name={"approach"}
                    label="Approach"
                    onChange={(e) => {
                      onChange(String(e.target.value));
                    }}
                    error={scenarioErrors?.num_iterations !== undefined}
                    variant="standard"
                  >
                    <MenuItem value={"CA"}>CA | Calendar Only</MenuItem>
                    <MenuItem value={"AR"}>AR | Add/Remove Only</MenuItem>
                    <MenuItem value={"CO"}>CO | CA/AR combined </MenuItem>
                    <MenuItem value={"CAAR"}>CAAR | First CA then AR </MenuItem>
                    <MenuItem value={"ARCA"}>ARCA | First AR then CA </MenuItem>
                    <MenuItem value={"ALL"}>ALL | All approaches </MenuItem>
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

export default GlobalConstraints;
