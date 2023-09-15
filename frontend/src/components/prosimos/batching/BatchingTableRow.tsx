import { TableRow, TableCell, IconButton, Collapse, Box } from "@mui/material";
import React from "react";
import { UseFormReturn, Controller, FieldArrayWithId } from "react-hook-form";
import { JsonData, CalendarMap } from "../formData";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from '@mui/icons-material/Delete';
import TaskBatching from "./TaskBatching";
import TaskSelect from "./TaskSelect";
import { AllModelTasks } from "../modelData";
import { colWidth } from "./AllBatching";
import { AutoSizer } from "react-virtualized";

interface BatchingTableRowProps {
    onResourcePoolDelete: (index: number) => void
    formState: UseFormReturn<JsonData, object>
    calendars?: CalendarMap
    setErrorMessage: (value: string) => void
    style: any
    handleExpansion: (i: number) => void
    rowOpenState: boolean
    field: FieldArrayWithId<JsonData, "batch_processing", "key">
    taskIndex: number
    tasksFromModel: AllModelTasks
}

const BatchingTableRow = (props: BatchingTableRowProps) => {
    const { field, taskIndex, tasksFromModel } = props
    const { onResourcePoolDelete, formState: { control: formControl, formState: { errors } } } = props

    const { batch_processing : batchProcessingErrors } = errors as any
    const specificTaskBatchProcessing = batchProcessingErrors?.[taskIndex]
    const anyErrors = batchProcessingErrors || specificTaskBatchProcessing

    const onOpenRow = () => {
        props.handleExpansion(
            props.taskIndex
        )
    };

    const getHeightForRow = () => {
        if (!props.rowOpenState) {
            return { height: "inherit" }
        }
    }

    return (
        <React.Fragment>
            <TableRow style={{ ...props.style }} >
                <TableRow hover style={getHeightForRow()}>
                    <TableCell style={{ width: colWidth[0] }}>
                        <IconButton
                            size="small"
                            onClick={onOpenRow}
                        >
                            {props.rowOpenState ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell style={{ width: colWidth[1] }}>
                        <Controller
                            name={`batch_processing.${taskIndex}.task_id`}
                            control={formControl}
                            render={({ field }) => (
                                <TaskSelect
                                    field={field}
                                    tasksFromModel={tasksFromModel}
                                    fieldError={anyErrors}
                                />
                            )}
                        />
                    </TableCell>
                    <TableCell style={{ width: colWidth[2] }}>
                        <IconButton
                            size="small"
                            onClick={() => onResourcePoolDelete(taskIndex)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                        <Collapse in={props.rowOpenState} timeout="auto" unmountOnExit>
                            <Box margin={1} height={"400px"}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <TaskBatching
                                            key={field.key}
                                            formState={props.formState}
                                            taskIndex={taskIndex}
                                            style={{
                                                height: height,
                                                width: width
                                            }}
                                        />
                                    )}
                                </AutoSizer>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </TableRow>
        </React.Fragment>
    );
};

export default BatchingTableRow;
