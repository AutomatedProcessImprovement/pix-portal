import { Controller, useFieldArray, UseFormReturn } from "react-hook-form"
import { TableRow, TableCell, Checkbox, TextField } from "@mui/material"
import WeekdaySelect from "./WeekdaySelect"
import TimePickerController from "./TimePickerController"
import { JsonData } from "../formData"
import TimePeriodActionsColumn from "./TimePeriodActionsColumn"

const colWidth = [ "1%", "18%", "15%", "15%", "14%", "14%", "15%" ]

interface TimePeriodTableRowsProps {
    formState: UseFormReturn<JsonData, object>
    index: number,
    isItemSelected: boolean
    handleClick: (name: string) => void
    style: any
    updateRowSizes: (index: number, timePeriodsCount: number) => void
}

const defaultTimePeriod = {
    from: "MONDAY",
    to: "THURSDAY",
    beginTime: "09:00:00.000",
    endTime: "17:00:00.000"  
}

const TimePeriodTableRows = (props: TimePeriodTableRowsProps) => {
    const { formState: { control: formControl, getValues, formState: { errors } }, index, isItemSelected, handleClick } = props

    const { fields: timePeriodsFields, append, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `resource_calendars.${index}.time_periods`
    })

    const currCalendar = getValues(`resource_calendars.${index}`)
    const calErrors = errors.resource_calendars?.[index]

    const onTimePeriodAdd = () => {
        append(defaultTimePeriod)
        props.updateRowSizes(index, timePeriodsFields.length + 1)
    }

    const onTimePeriodDelete = (index: number, tpIndex: number) => {
        remove(tpIndex)
        props.updateRowSizes(index, timePeriodsFields.length - 1)
    }

    return <TableRow style={props.style}>
        {timePeriodsFields.map((timePeriod, tpIndex) => {
            const isOnlyOneRow = timePeriodsFields.length === 1
            const isLastRow = (timePeriodsFields.length-1) === tpIndex
            const isFirstRow = (tpIndex === 0)
            const currErrors = calErrors?.time_periods?.[tpIndex]

            return <TableRow 
                key={`timePeriod_${index}_${timePeriod.key}`}
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                selected={isItemSelected}
            >
                <TableCell width={colWidth[0]} padding="checkbox">
                    {isFirstRow && <Checkbox
                        color="primary"
                        checked={props.isItemSelected}
                        onChange={() => handleClick(currCalendar.id)}
                    />}
                </TableCell>
                <TableCell width={colWidth[1]}>
                    {isFirstRow &&
                        <Controller
                            name={`resource_calendars.${index}.name`}
                            control={formControl}
                            render={({ field: { ref, ...others } }) => (
                                <TextField
                                    {...others}
                                    inputRef={ref}
                                    error={calErrors?.name !== undefined}
                                    helperText={calErrors?.name?.message || ""}
                                    variant="standard"
                                    placeholder="Resource calendar name"
                                />
                            )}
                        />
                    }
                </TableCell>
                <TableCell width={colWidth[2]}>
                    <Controller
                        name={`resource_calendars.${index}.time_periods.${tpIndex}.from`}
                        control={formControl}
                        render={({ field }) => (
                            <WeekdaySelect
                                field={field}
                                fieldError={currErrors?.from}
                            />
                        )}
                    />
                </TableCell>
                <TableCell width={colWidth[3]}>
                    <Controller
                        name={`resource_calendars.${index}.time_periods.${tpIndex}.to`}
                        control={formControl}
                        render={({ field }) => (
                            <WeekdaySelect
                                field={field}
                                fieldError={currErrors?.to}
                            />
                        )}
                    />
                </TableCell>
                <TableCell width={colWidth[4]}>
                    <TimePickerController
                        name={`resource_calendars.${index}.time_periods.${tpIndex}.beginTime` as unknown as keyof JsonData}
                        formState={props.formState}
                        fieldError={currErrors?.beginTime}
                    />
                </TableCell>
                <TableCell width={colWidth[5]}>
                    <TimePickerController
                        name={`resource_calendars.${index}.time_periods.${tpIndex}.endTime` as unknown as keyof JsonData}
                        formState={props.formState}
                        fieldError={currErrors?.endTime}
                    />
                </TableCell>
                <TableCell width={colWidth[6]}>
                    <TimePeriodActionsColumn
                        isOnlyOneRow={isOnlyOneRow}
                        isLastRow={isLastRow}
                        index={index}
                        tpIndex={tpIndex}
                        onTimePeriodDelete={onTimePeriodDelete}
                        onTimePeriodAdd={onTimePeriodAdd}
                    />
                </TableCell>
            </TableRow>
        })}
    </TableRow>
}

export default TimePeriodTableRows;
