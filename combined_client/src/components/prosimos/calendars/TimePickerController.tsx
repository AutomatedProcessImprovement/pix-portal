import moment from "moment";
import { Controller, FieldError, Path, UseFormReturn } from "react-hook-form";
import { LocalizationProvider, TimePicker } from "@mui/lab";
import AdapterMoment from "@mui/lab/AdapterMoment";
import { TextField } from "@mui/material";

const datetimeFormat = 'HH:mm:ss.SSS'

interface TimePickerControllerProps<FieldValues> {
    name: Path<FieldValues>
    formState: UseFormReturn<FieldValues, object>
    label?: string
    fieldError?: FieldError
}

const TimePickerController = <FieldValues, > (props: TimePickerControllerProps<FieldValues>) => {
    const { formState: { control: formControl }, name, label } = props
    const { fieldError } = props

    const getCurrentValue = (value: any) => {
        if (value === "")
            return null
        else
            return moment(value as string, datetimeFormat)
    }

    return (
        <Controller
            name={name as Path<FieldValues>}
            control={formControl}
            rules={{ required: true }}
            render={({ 
                field: { onChange, value },
            }) => (
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <TimePicker
                        label={label}
                        renderInput={(props) => 
                            <TextField 
                                {...props}
                                variant="standard"
                                error={fieldError !== undefined}
                                helperText={fieldError?.message || ""}
                            />}
                        views={['hours', 'minutes']}
                        inputFormat={'HH:mm'}
                        mask="__:__"
                        value={getCurrentValue(value)}
                        onChange={(newValue) => {
                            const newValueString = moment(newValue).format(datetimeFormat)
                            onChange(newValueString)
                        }}
                    />
                </LocalizationProvider>
            )}
        />
    )
}

export default TimePickerController;