import { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { ControllerRenderProps, FieldError } from "react-hook-form";

interface WeekdaySelectProps<FieldValues>{
    field: ControllerRenderProps<FieldValues, any>,
    label?: string
    fieldError?: FieldError
    style?: any
}

const WeekdaySelect = <FieldValues,>(props: WeekdaySelectProps<FieldValues>) => {
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const propsMessage = props.fieldError?.message
        if (propsMessage && propsMessage !== errorMessage) {
            setErrorMessage(propsMessage)
        }
    }, [errorMessage, props.fieldError])

    return (
        <TextField 
            sx={props.style ? props.style : { width: "100%" }}
            {...props.field}
            error={!!props.fieldError}
            helperText={errorMessage}
            label={props.label}
            variant="standard"
            select
        >
            <MenuItem value="MONDAY">Monday</MenuItem>
            <MenuItem value="TUESDAY">Tuesday</MenuItem>
            <MenuItem value="WEDNESDAY">Wednesday</MenuItem>
            <MenuItem value="THURSDAY">Thursday</MenuItem>
            <MenuItem value="FRIDAY">Friday</MenuItem>
            <MenuItem value="SATURDAY">Saturday</MenuItem>
            <MenuItem value="SUNDAY">Sunday</MenuItem>
        </TextField>
    )
}

export default WeekdaySelect;
