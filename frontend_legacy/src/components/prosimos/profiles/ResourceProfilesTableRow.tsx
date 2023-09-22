import { TableRow, TableCell, TextField } from "@mui/material";
import { Controller, UseFormReturn } from "react-hook-form";
import { JsonData } from "../formData";
import ActionsColumn from "./ActionsColumn";
import { colWidth } from "./ResourceProfilesTable";

export interface ResourceProfilesTableRowProps {
    index: number
    resourcePoolIndex: number
    style: any
    errors: any
    formState: UseFormReturn<JsonData, object>
    onResourceProfileDelete: (index: number) => void
    onViewCalendarClick: (resourcePoolIndex: number, index: number) => void
    onResourceListCountChange: (count: number) => void
}

const ResourceProfilesTableRow = (props: ResourceProfilesTableRowProps) => {
    const {
        index,
        resourcePoolIndex,
        style,
        errors,
        formState: { control: formControl, getValues},
        onResourceProfileDelete,
        onViewCalendarClick,
        onResourceListCountChange
    } = props

    const isError = errors?.[index]
    const nameError = isError && errors?.[index].name
    const costPerHourError = isError && errors?.[index].cost_per_hour
    const amountError = isError && errors?.[index].amount

    return <TableRow key={`table_row_${resourcePoolIndex}_${index}`} hover style={{ ...style }}>
        <TableCell width={colWidth[0]} style = {{
            height: "inherit",
            paddingTop: "0px",
            paddingBottom: "0px" }}
        >
            <Controller
                name={`resource_profiles.${resourcePoolIndex}.resource_list.${index}.name`}
                control={formControl}
                render={({ field }) => (
                    <TextField
                        {...field}
                        style={{ width: "100%" }}
                        error={nameError !== undefined}
                        helperText={nameError?.message || ""}
                        variant="standard"
                        placeholder="Resource profile name"
                    />
                )}
            />
        </TableCell>
        <TableCell width={colWidth[1]}>
            <Controller
                name={`resource_profiles.${resourcePoolIndex}.resource_list.${index}.cost_per_hour`}
                control={formControl}
                render={({ field }) => (
                    <TextField
                        {...field}
                        type="number"
                        error={costPerHourError !== undefined}
                        helperText={costPerHourError?.message || ""}
                        variant="standard"
                        inputProps={{
                            min: 0,
                            inputMode: "decimal",
                            step: "0.1"
                        }}
                        style={{ width: "100%" }}
                        placeholder="Cost"
                    />
                )}
            />
        </TableCell>
        <TableCell key={`tc_${resourcePoolIndex}_${index}_amount`} width={colWidth[2]}>
            <Controller
                key={`${resourcePoolIndex}_${index}_amount_controller`}
                name={`resource_profiles.${resourcePoolIndex}.resource_list.${index}.amount`}
                control={formControl}
                render={({ field: { onChange, ...others }}) => {
                    return <TextField
                        key={`${resourcePoolIndex}_${index}_amount`}
                        {...others}
                        onChange={(e) => {
                            const prevValue = getValues(`resource_profiles.${resourcePoolIndex}.resource_list.${index}.amount`)
                            const newNum = Number(e.currentTarget.value) - prevValue
                            onResourceListCountChange(newNum)
                            onChange(e)
                        }}
                        type="number"
                        error={amountError !== undefined}
                        helperText={amountError?.message || ""}
                        variant="standard"
                        inputProps={{
                            min: 0
                        }}
                        style={{ width: "100%" }}
                        placeholder="Amount"
                    />
                }
                }
            />
        </TableCell>
        <TableCell width={colWidth[3]}>
            <ActionsColumn
                onViewCalendarClick={() => onViewCalendarClick(resourcePoolIndex, index)}
                onDeleteClick={() => onResourceProfileDelete(index)}
            />
        </TableCell>
    </TableRow>
}

export default ResourceProfilesTableRow;