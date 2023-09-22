import { useState, useEffect, ChangeEvent } from "react";
import { IconButton, Grid, TextField } from "@mui/material";
import { Controller, Path, UseFormReturn } from "react-hook-form";
import { REQUIRED_ERROR_MSG } from "../validationMessages";
import DeleteIcon from '@mui/icons-material/Delete';
import { JsonData } from "../formData";

interface DistributionMappingRowProps {
    formState: UseFormReturn<JsonData, object>
    objectFieldName: string
    isWithDeleteButton: boolean
    onDelete?: (index: number) => void
    rowIndex: number
    valueLabel: string
    keyTextFieldProps: { label: string, type: string }
}

const getPathWithoutSpecificAttr = (specificPath: string) => {
    // remove the last subpath (the one after the last dot)
    return specificPath.substr(0, specificPath.lastIndexOf("."));
}

const DistributionMappingRow = (props: DistributionMappingRowProps) => {
    const { formState: { control: formControl, formState: { errors }, trigger },
        objectFieldName, isWithDeleteButton, onDelete, rowIndex, valueLabel } = props
    const [keyErrors, setKeyErrors] = useState({})
    const [valueErrors, setValueErrors] = useState({})

    useEffect(() => {
        const isErrorsEmpty = Object.keys(errors).length !== 0
        if (isErrorsEmpty && (objectFieldName !== undefined)) {
            // remove the path to the specific attribute
            const path = getPathWithoutSpecificAttr(objectFieldName)

            let currLocalErrors = errors as any
            path.split(".").forEach((key) => {
                currLocalErrors = currLocalErrors?.[key];
            })

            const finalErrors = currLocalErrors

            verify_no_errors(finalErrors)

            if (finalErrors !== undefined) {
                if (finalErrors.type === "sum") {
                    setValueErrors(finalErrors)
                } else if (finalErrors.type === "unique") {
                    setKeyErrors(finalErrors)
                }
            }

            // in case of empty key field
            const keySpecificError = getKeySpecificError(finalErrors, rowIndex)
            if (keySpecificError?.message) {
                setKeyErrors(keySpecificError)
            }
        } else if (!isErrorsEmpty) {
            verify_no_errors(errors)
        }

    }, [JSON.stringify(errors), objectFieldName])

    const verify_no_errors = (finalErrors: any) => {
        // in case of no errors - we set error's state as empty
        if (finalErrors?.type !== "sum") {
            setValueErrors("")
        }

        if (finalErrors?.type !== "unique") {
            setKeyErrors("")
        }

        // empty key field
        const keySpecificError = getKeySpecificError(finalErrors, rowIndex)
        if (!(keySpecificError || keySpecificError?.message)) {
            setKeyErrors("")
        }
    }

    const getKeySpecificError = (finalErrors: any, rowIndex: number) => {
        return (((finalErrors || {})[rowIndex] || {})["key"] || {})
    }

    const onDeleteClicked = () => {
        if (onDelete && rowIndex !== undefined) {
            onDelete(rowIndex)
        }
    }

    const onTextChangeWithTrigger = (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        onChange: any
    ) => {
        onChange(event.target.value)

        // update the validation errors
        const path = getPathWithoutSpecificAttr(objectFieldName)
        trigger(path as Path<JsonData>)
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={5}>
                <Controller
                    name={`${objectFieldName}.key` as Path<JsonData>}
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field: { ref, onChange, ...others } }) => {
                        return (
                            <TextField
                                {...others}
                                onChange={(e) => onTextChangeWithTrigger(e, onChange)}
                                inputRef={ref}
                                style={{ width: "100%" }}
                                error={!!(keyErrors as any)?.message}
                                helperText={(keyErrors as any)?.message}
                                variant="standard"
                                {...props.keyTextFieldProps}
                            />
                        )
                    }}
                />
            </Grid>
            <Grid item xs={5}>
                <Controller
                    name={`${objectFieldName}.value` as Path<JsonData>}
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field: { ref, onChange, ...others } }) => {
                        return (
                            <TextField
                                {...others}
                                onChange={(e) => onTextChangeWithTrigger(e, onChange)}
                                inputRef={ref}
                                style={{ width: "100%" }}
                                error={!!(valueErrors as any)?.message}
                                helperText={(valueErrors as any)?.message}
                                variant="standard"
                                label={valueLabel}
                                type="number"
                                inputProps={{
                                    min: 0,
                                    step: "0.1"
                                }}
                            />
                        )
                    }}
                />
            </Grid>
            {isWithDeleteButton && <Grid item xs={2} style={{
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <IconButton
                    size="small"
                    onClick={onDeleteClicked}
                >
                    <DeleteIcon />
                </IconButton>
            </Grid>}
        </Grid>
    )
}

export default DistributionMappingRow;
