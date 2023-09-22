import { Card, Grid, TextField, Typography } from "@mui/material";
import { Controller, UseFormReturn } from "react-hook-form";
import { JsonData, ScenarioProperties } from "../formData";
import { REQUIRED_ERROR_MSG, SHOULD_BE_GREATER_0_MSG } from "../validationMessages";
import AdapterMoment from "@mui/lab/AdapterMoment";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import moment from "moment";
import ArrivalTimeDistr from "./ArrivalTimeDistr";

interface CaseCreationProps {
    scenarioFormState: UseFormReturn<ScenarioProperties, object>
    jsonFormState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const CaseCreation = (props: CaseCreationProps) => {
    const { control: formControl, formState: { errors } } = props.scenarioFormState
    
    return (
        <Card elevation={5} sx={{ p: 2 }}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" align="left">
                    Scenario specification
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Controller
                    name="num_processes"
                    control={formControl}
                    rules={{ 
                        required: REQUIRED_ERROR_MSG, 
                        min: { value: 1, message: SHOULD_BE_GREATER_0_MSG }
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextField
                            type="number"
                            value={value}
                            label="Total number of cases"
                            onChange={(e) => {
                                onChange(Number(e.target.value))
                            }}
                            inputProps={{
                                step: "1",
                                min: "1",
                            }}
                            error={errors?.num_processes !== undefined}
                            helperText={errors?.num_processes?.message || ""}
                            variant="standard"
                            style={{ width: "50%" }}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <Controller
                    name="start_date"
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field: { onChange, value } }) => (
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DateTimePicker
                                label="Scenario start date and time"
                                renderInput={(props) => 
                                    <TextField 
                                        {...props}
                                        variant="standard"
                                        style={{ width: "50%" }}
                                    />
                                }
                                value={moment(value as string, 'YYYY-MM-DDTHH:mm:ss.sssZ')}
                                onChange={(newValue) => {
                                    const newValueString = moment(newValue).format('YYYY-MM-DDTHH:mm:ss.sssZ')
                                    onChange(newValueString)
                                }}
                            />
                        </LocalizationProvider>
                    )}
                />
            </Grid>
            <ArrivalTimeDistr
                formState={props.jsonFormState}
                setErrorMessage={props.setErrorMessage}
            />
        </Grid>
        </Card>
    )
}

export default CaseCreation;