import { Box, Collapse, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { JsonData, ResourceMap, ResourcePool } from "../formData";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ResourceDistribution from "./ResourceDistribution";
import { AllModelTasks } from "../modelData";
import { defaultResourceAllocationDist } from "../simulationParameters/defaultValues";
import { FormHelperText } from '@mui/material';
import { AutoSizer, List } from "react-virtualized";
import AddButtonToolbar from "../toolbar/AddButtonToolbar"

const TASK_RESOURCE_DISTR = "task_resource_distribution"
interface ResourceAllocationProps {
    tasksFromModel: AllModelTasks
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

interface RowProps {
    taskName: string
    allocationIndex: number
    allowedResources: { [key: string]: { name: string } }
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const Row = (props: RowProps) => {
    const { allocationIndex, taskName, allowedResources, setErrorMessage } = props
    const { formState: { control: formControl, trigger, formState: { errors } } } = props
    const [openModule, setOpenModule] = useState(false)
    const [isRowAdded, setIsRowAdded] = useState(false)
    const listRef = useRef<List>(null)

    const rowErrors = errors?.task_resource_distribution?.[allocationIndex]?.resources as any

    const { fields, append, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `${TASK_RESOURCE_DISTR}.${allocationIndex}.resources`
    })

    useEffect(() => {
        if (isRowAdded) {
            if (listRef.current) {
                listRef.current.scrollToRow(fields.length)
            }
            setIsRowAdded(false)
        }
    }, [fields, isRowAdded]);

    const onResourceAllocationAdd = async () => {
        if (!allowedResources || Object.keys(allowedResources).length === 0) {
            setErrorMessage("Provide resource profiles before proceeding")
            return
        }

        await trigger(`task_resource_distribution.${allocationIndex}.resources`)
        const rowResourcesErrors = errors?.task_resource_distribution?.[allocationIndex]?.resources

        if (rowResourcesErrors !== undefined && rowResourcesErrors.length > 0) {
            setErrorMessage("Verify the correctness of all entered Resource Allocations")
            return
        }

        append(defaultResourceAllocationDist)
        setIsRowAdded(true)
        if ((rowResourcesErrors as any)?.type === "min") {
            await trigger(`task_resource_distribution.${allocationIndex}.resources`)
        }
    }

    const onResourceAllocationDelete = (index: number) => {
        if (fields.length === 1) {
            setErrorMessage("At least one resource allocation for the task should be provided")
            return
        }

        remove(index)
    }

    const renderRow = ({ index, key, style }: any) => {
        const resourceDistr = fields[index]

        return (
            <Grid item xs={12} key={`resource_distr_${resourceDistr.key}`} style={{ ...style, padding: "10px" }}>
                <ResourceDistribution
                    formState={props.formState}
                    allocationIndex={allocationIndex}
                    resourceIndex={index}
                    allowedResources={allowedResources}
                    setErrorMessage={setErrorMessage}
                    onResourceAllocationDelete={onResourceAllocationDelete}
                />
            </Grid>
        )
    };

    const getHeightForCollapseRow = useMemo(() => {
        if (fields.length <= 1) {
            return { minHeight: "30vh" }
        } else {
            return { minHeight: "40vh" }
        }
    }, [fields])

    const getTaskErrors = () => {
        return (rowErrors !== undefined) ? (rowErrors?.message || "There are some validation errors") : " "
    }

    return (
        <React.Fragment>
            <TableRow hover>
                <TableCell style={{ width: "62px" }}>
                    <IconButton
                        size="small"
                        onClick={() => setOpenModule(!openModule)}
                    >
                        {openModule ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell
                    style={{ paddingBottom: "0px" }}
                >
                    <Typography>
                        {taskName}
                    </Typography>
                    <FormHelperText
                        error={rowErrors !== undefined}
                    >{getTaskErrors()}</FormHelperText>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openModule} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} style={getHeightForCollapseRow}>
                                    <AutoSizer>
                                        {({ width, height }) => {
                                            return <List
                                                ref={listRef}
                                                width={width}
                                                height={height}
                                                rowHeight={235}
                                                rowRenderer={renderRow}
                                                rowCount={fields.length}
                                                overscanRowCount={2}
                                            />
                                        }}
                                    </AutoSizer>
                                </Grid>
                                <Grid item xs={12}>
                                    <AddButtonToolbar
                                        labelName="new resource allocation"
                                        onClick={onResourceAllocationAdd}
                                        tooltipText="Add new resource allocation"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

const ResourceAllocation = (props: ResourceAllocationProps) => {
    const { tasksFromModel } = props

    const { control: formControl, getValues } = props.formState
    const { fields } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: TASK_RESOURCE_DISTR
    })

    const profiles = getValues("resource_profiles")?.reduce((acc: ResourceMap, currProfile: ResourcePool) => {
        const resources = currProfile.resource_list?.reduce((accResource, item) => ({
            ...accResource,
            [item.id]: { name: item.name }
        }), {})

        return {
            ...acc,
            ...resources
        } as ResourceMap
    }, {}) ?? {}

    return (
        <Grid container spacing={2}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Task</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((allocation, index) => {
                            const currentTask = tasksFromModel[allocation.task_id]

                            return <Row key={allocation.task_id}
                                taskName={currentTask.name}
                                allocationIndex={index}
                                allowedResources={profiles}
                                formState={props.formState}
                                setErrorMessage={props.setErrorMessage}
                            />
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default ResourceAllocation;
