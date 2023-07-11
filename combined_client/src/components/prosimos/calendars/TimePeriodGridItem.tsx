import { IconButton } from "@mui/material";
import { Grid } from "@mui/material";
import { Controller, Path, UseFormReturn } from "react-hook-form";
import { REQUIRED_ERROR_MSG } from "../validationMessages";
import TimePickerController from "./TimePickerController";
import WeekdaySelect from "./WeekdaySelect";
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from "react";

interface TimePeriodGridItemProps<FieldValues> {
    formState: UseFormReturn<FieldValues, object>
    objectFieldName: string
    timePeriodIndex?: number
    isWithDeleteButton: boolean
    onDelete?: (index: number) => void
}

const TimePeriodGridItem = <FieldValues,>(props: TimePeriodGridItemProps<FieldValues>) => {
    const { formState: { control: formControl, formState: { errors } }, objectFieldName, isWithDeleteButton, timePeriodIndex, onDelete } = props
    const [currErrors, setCurrErrors] = useState({})

    useEffect(() => {
        if (Object.keys(errors).length !== 0) {
            let currErrors = errors as any
            objectFieldName.split(".").forEach((key) => {
                currErrors = currErrors?.[key];
            })
            const finalErrors = currErrors || "Something went wrong, please check the simulation scenario parameters"
            setCurrErrors(finalErrors)
        }
    }, [errors, objectFieldName])

    const onDeleteClicked = () => {
        if (onDelete && timePeriodIndex !== undefined) {
            onDelete(timePeriodIndex)
        }
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={2.5}>
                <Controller
                    name={`${objectFieldName}.from` as Path<FieldValues>}
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field }) => (
                        <WeekdaySelect
                            field={field}
                            label="Begin Day"
                            fieldError={(currErrors as any)?.from}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={2.5}>
                <Controller
                    name={`${objectFieldName}.to` as Path<FieldValues>}
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field }) => (
                        <WeekdaySelect
                            field={field}
                            label="End Day"
                            fieldError={(currErrors as any)?.to}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={2.5}>
                <TimePickerController
                    name={`${objectFieldName}.beginTime` as Path<FieldValues>}
                    formState={props.formState}
                    label="Begin Time"
                    fieldError={(currErrors as any)?.beginTime}
                />
            </Grid>
            <Grid item xs={2.5}>
                <TimePickerController
                    name={`${objectFieldName}.endTime` as Path<FieldValues>}
                    formState={props.formState}
                    label="End Time"
                    fieldError={(currErrors as any)?.endTime}
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

export default TimePeriodGridItem;