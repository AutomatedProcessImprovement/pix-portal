import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { ControllerRenderProps, FieldError } from "react-hook-form";
import { AllModelTasks } from "../modelData";

interface BatchingTypeSelectProps<FieldValues>{
    field: ControllerRenderProps<FieldValues, any>,
    label?: string
    fieldError?: FieldError
    tasksFromModel: AllModelTasks
}

const TaskSelect = <FieldValues,>(props: BatchingTypeSelectProps<FieldValues>) => {
    const { tasksFromModel, fieldError } = props
    const [errorToShow, setErrorToShow] = useState("")

    useEffect(() => {
        let newMessage = fieldError?.message || ""

        if (newMessage === "" && fieldError !== undefined) {
            // child has some errors
            newMessage = "There are validation errors"
        }

        if (newMessage !== errorToShow) {
            setErrorToShow(newMessage)
        }
    }, [errorToShow, fieldError])

    return (
        <TextField 
            sx={{ width: "75%" }}
            {...props.field}
            error={fieldError !== undefined}
            helperText={errorToShow}
            label={props.label}
            variant="standard"
            select
        >
            {Object.entries(tasksFromModel).map((field, index) => {
                const taskId = field[0]
                const taskDetails = field[1]
                return (
                    <MenuItem key={`task-option-${taskId}`}value={taskId}>
                        {taskDetails.name}
                    </MenuItem>
                )
            })}
        </TextField>
    )
}

export default TaskSelect;
