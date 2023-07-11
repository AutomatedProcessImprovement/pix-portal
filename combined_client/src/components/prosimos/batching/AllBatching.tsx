import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { AutoSizer } from "react-virtualized";
import { VariableSizeList } from "react-window"
import { JsonData } from "../formData";
import { AllModelTasks } from "../modelData";
import { removeArrayElemByIndex } from "../ResourcePools";
import AddButtonToolbar from "../toolbar/AddButtonToolbar";
import { MIN_LENGTH_REQUIRED_MSG } from "../validationMessages";
import BatchingTableRow from "./BatchingTableRow";

export const BATCH_PROCESSING = "batch_processing"
export const colWidth = ["10%", "90%", "10%"]

const ROW_HEIGHT = 80;
const OPEN_ROW_HEIGHT = 480;

interface AllBatchingProps {
    tasksFromModel: AllModelTasks
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const AllBatching = (props: AllBatchingProps) => {
    const { tasksFromModel, formState: { control: formControl, trigger, setFocus }, setErrorMessage } = props

    const { fields, prepend, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `${BATCH_PROCESSING}`
    })

    const [isRowAdding, setIsRowAdding] = useState(false)

    const initialRowSizes = new Array(fields.length).fill(ROW_HEIGHT)
    const [rowSizes, setRowSizes] = useState<number[]>(initialRowSizes)
    const initialRowState = Array(fields.length).fill(false)
    const [rowOpenState, setRowOpenState] = useState<boolean[]>(initialRowState)

    const ref = React.useRef<VariableSizeList>(null);

    useEffect(() => {
        if (isRowAdding) {
            setFocus('batch_processing.1.task_id')
            setIsRowAdding(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields, isRowAdding])

    const onNewTaskBatchCreation = async () => {
        const arePrevResourcesValid = await trigger(`batch_processing`)
        if (!arePrevResourcesValid) {
            setErrorMessage("Verify the correctness of all entered Task Batches")
            return
        }

        prepend({
            task_id: "",
            type: "Parallel",
            size_distrib: [
                {
                    "key": "1",
                    "value": 0,
                },
                {
                    "key": "2",
                    "value": 1
                }
            ],
            duration_distrib: [
                {
                    "key": "1",
                    "value": 0.9,
                }
            ],
            firing_rules: []
        })

        setIsRowAdding(true)

        const openRow = true
        setRowOpenState([
            openRow,
            ...rowOpenState,
        ])
        setRowSizes([
            (openRow ? OPEN_ROW_HEIGHT : ROW_HEIGHT),
            ...rowSizes,
        ])

        if (ref.current) {
            ref.current && ref.current!.resetAfterIndex(0);
        }
    };

    const onResourcePoolDeletion = (index: number) => {
        if (fields.length === 1) {
            setErrorMessage(MIN_LENGTH_REQUIRED_MSG("resource profile"))
            return
        }

        remove(index)

        setRowSizes(removeArrayElemByIndex(index, rowSizes))
        setRowOpenState(removeArrayElemByIndex(index, rowOpenState))

        if (ref.current) {
            ref.current && ref.current!.resetAfterIndex(0);
        }
    };

    const handleExpansion = (i: number) => {
        if (ref.current) {
            ref.current && ref.current!.resetAfterIndex(i, false);
        }

        setRowSizes([
            ...rowSizes.slice(0, i),
            rowSizes[i] === ROW_HEIGHT ? OPEN_ROW_HEIGHT : ROW_HEIGHT,
            ...rowSizes.slice(i + 1)
        ])

        setRowOpenState([
            ...rowOpenState.slice(0, i),
            !rowOpenState[i],
            ...rowOpenState.slice(i + 1),
        ])
    };

    const getItemSize = (index: number) => {
        return rowSizes[index]
    };

    const renderRow = (
      // @ts-ignore
      { style, index, data }: any) => {
        const currentField = fields[index]

        return (
            <BatchingTableRow key={currentField.key}
                style={{ ...style }}
                onResourcePoolDelete={onResourcePoolDeletion}
                formState={props.formState}
                setErrorMessage={setErrorMessage}
                handleExpansion={handleExpansion}
                rowOpenState={rowOpenState[index]}
                field={currentField}
                taskIndex={index}
                tasksFromModel={tasksFromModel}
            />
        )
    };

    return <Grid container spacing={2}>
        <Toolbar sx={{ justifyContent: "flex-end", marginLeft: "auto" }}>
            <AddButtonToolbar
                onClick={onNewTaskBatchCreation}
                labelName="new task batching"
            />
        </Toolbar>

        <TableContainer component={Paper} style={{ width: "100%", height: "60vh" }}>
            <Table style={{ width: "100%", height: "60vh" }}>
                <TableHead>
                    <TableRow>
                        <TableCell style={{ width: colWidth[0] }}></TableCell>
                        <TableCell style={{ width: colWidth[1] }}>Task</TableCell>
                        <TableCell style={{ width: colWidth[2] }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody style={{ height: "50vh" }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <VariableSizeList
                                ref={ref}
                                width={width}
                                height={height}
                                itemSize={getItemSize}
                                itemCount={fields.length}
                                itemData={fields}
                                itemKey={(i: number) => fields[i].key}
                                overscanCount={4}
                            >
                                {renderRow}
                            </VariableSizeList>
                        )}
                    </AutoSizer>
                </TableBody>
            </Table>
        </TableContainer>
    </Grid>
}

export default AllBatching;