import { MenuItem, TextField } from "@mui/material";
import { ControllerRenderProps, FieldError } from "react-hook-form";

interface BatchingTypeSelectProps<FieldValues>{
    field: ControllerRenderProps<FieldValues, any>,
    label?: string
    fieldError?: FieldError
}

const BatchingTypeSelect = <FieldValues,>(props: BatchingTypeSelectProps<FieldValues>) => {
    return (
        <TextField 
            sx={{ width: "75%" }}
            {...props.field}
            error={props.fieldError !== undefined}
            helperText={props.fieldError?.message || ""}
            label={props.label}
            variant="standard"
            select
        >
            <MenuItem key="seq-menuitem" value="Sequential">Sequential</MenuItem>
            <MenuItem key="parallel-menuitem" value="Parallel">Parallel</MenuItem>
        </TextField>
    )
}

export default BatchingTypeSelect;
