import { MenuItem, TextField } from "@mui/material"
import { useState, useEffect, ChangeEvent } from "react"
import { Controller, FieldError } from "react-hook-form"
import { UpdateAndRemovePrioritisationErrors } from "../simulationParameters/usePrioritisationErrors"

const INVALID_VALUE_MESSAGE = "Invalid value"

interface QueryValueDiscreteSelectProps {
    conditionValueName: string
    fieldError?: FieldError
    formState: any
    allPossibleOptions: string[]
    style: any
    updateAndRemovePrioritisationErrors: UpdateAndRemovePrioritisationErrors
}

const QueryValueDiscreteSelect = (props: QueryValueDiscreteSelectProps) => {
    const [updateErrors, removeErrors] = props.updateAndRemovePrioritisationErrors
    const { conditionValueName, fieldError, formState: { control, getValues }, allPossibleOptions, style } = props
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const propsMessage = fieldError?.message
        if (propsMessage && propsMessage !== errorMessage) {
            setErrorMessage(propsMessage)
        }
    }, [errorMessage, fieldError])

    useEffect(() => {
        const currValue = getValues(conditionValueName)
        setErrorIfInvalid(currValue ?? "")
    }, [])

    const setErrorIfInvalid = (currValue: string) => {
        if (!allPossibleOptions.includes(currValue)) {
            // the value provided is not valid
            // (it means the case attribute does not have this value as an option)
            setErrorMessage(INVALID_VALUE_MESSAGE)
            updateErrors(conditionValueName, INVALID_VALUE_MESSAGE)
            return true
        }

        return false
    }

    const validateAndChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, onChange: any) => {
        const newValue = e.target?.value ?? ""
        const isInvalid = setErrorIfInvalid(newValue)
        if (!isInvalid) {
            // remove errors
            setErrorMessage("")
            removeErrors(conditionValueName)

            // clear the error field
            onChange(e)
        }
    }

    return (
        <Controller
            name={conditionValueName}
            control={control}
            render={({ field: { onChange, value } }) => (
                <TextField
                    value={value}
                    onChange={e => validateAndChange(e, onChange)}
                    sx={style ? style : { width: "100%" }}
                    error={errorMessage !== ""}
                    helperText={errorMessage}
                    label="Value"
                    variant="standard"
                    select
                >
                    {allPossibleOptions.map((item) => (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                </TextField>
            )}
        />
    )
}

export default QueryValueDiscreteSelect;
