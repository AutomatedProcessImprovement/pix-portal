import { useFieldArray, UseFormReturn } from "react-hook-form";
import { JsonData } from "../formData";
import TimeDistribution from "../distributions/TimeDistribution";
import { Grid, Typography } from "@mui/material";
import { defaultWorkWeekTimePeriod } from "../simulationParameters/defaultValues";
import { MIN_LENGTH_REQUIRED_MSG } from "../validationMessages";
import TimePeriodGridItemsWithAdd from "../calendars/TimePeriodGridItemsWithAdd";

interface ArrivalTimeDistrProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const ArrivalTimeDistr = (props: ArrivalTimeDistrProps) => {
    const { formState: { errors }, control: formControl } = props.formState    
    const currentErrors = errors?.arrival_time_distribution

    const { fields: arrivalCalendarFields, append, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `arrival_time_calendar`
    })

    const onTimePeriodAdd = () => {
        append(defaultWorkWeekTimePeriod)
    }

    const onTimePeriodRemove = (index: number) => {
        if (arrivalCalendarFields.length === 1) {
            props.setErrorMessage(MIN_LENGTH_REQUIRED_MSG("arrival time period"))
            return
        }

        remove(index)
    }

    return (<>
        <Grid item xs={12}>
            <TimeDistribution
                formState={props.formState}
                objectNamePath="arrival_time_distribution"
                errors={currentErrors}
                setErrorMessage={props.setErrorMessage}
                funcLabel="Inter arrival time"
            />
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h6" align="left">
                Arrival Time Calendar
            </Typography>
        </Grid>
        <TimePeriodGridItemsWithAdd
            fields={arrivalCalendarFields}
            formState={props.formState}
            objectFieldNamePart={"arrival_time_calendar"}
            onTimePeriodRemove={onTimePeriodRemove}
            onTimePeriodAdd={onTimePeriodAdd}
        />
    </>)
}

export default ArrivalTimeDistr;