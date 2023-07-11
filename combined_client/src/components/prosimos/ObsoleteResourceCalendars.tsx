import { alpha } from '@mui/material/styles'
import { Checkbox, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { useState, useEffect } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import AddButtonToolbar from "./toolbar/AddButtonToolbar"
import TimePeriodTableRows from "./calendars/TimePeriodTableRows"
import DeleteButtonToolbar from './toolbar/DeleteButtonToolbar'
import { JsonData } from './formData'
import { defaultTemplateSchedule } from './simulationParameters/defaultValues'
import { MIN_LENGTH_REQUIRED_MSG } from './validationMessages'
import { VariableSizeList } from 'react-window'
import { AutoSizer } from 'react-virtualized'
import React from 'react'

const ROW_HEIGHT = 67
const colWidth = [ "1%", "18%", "15%", "15%", "14%", "14%", "15%" ]

interface ResourceCalendarsProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const ResourceCalendars = (props: ResourceCalendarsProps) => {
    const { control: formControl, setFocus } = props.formState
    const { setErrorMessage } = props
    const [isRowAdding, setIsRowAdding] = useState(false)
    const listRef = React.useRef<VariableSizeList>(null)

    const { fields, prepend: prependCalendarFields, remove: removeCalendarsFields } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: "resource_calendars"
    })

    const initialRowSizes = new Array(fields.length).fill(true).reduce((acc, item, i) => {
        acc[i] = fields[i].time_periods.length * ROW_HEIGHT;
        return acc;
    }, [])
    const [rowSizes, setRowSizes] = useState<number[]>(initialRowSizes)

    const [selected, setSelected] = useState<readonly string[]>([])

    useEffect(() => {
        if (listRef.current) {
            listRef.current && listRef.current!.resetAfterIndex(0);
        }
    }, [rowSizes]);

    useEffect(() => {
        if (isRowAdding) {
            const firstVisibleRowBefore = 1
            setFocus(`resource_calendars.${firstVisibleRowBefore}.name`)
            setIsRowAdding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields, isRowAdding]);

    const onAddNewCalendar = () => {
        prependCalendarFields(defaultTemplateSchedule(true))

        setIsRowAdding(true)
        const rs = [
            ROW_HEIGHT * 2,
            ...rowSizes
        ]
        setRowSizes(rs)
    };

    const onDeleteCalendars = () => {
        if (fields.length === 1) {
            setErrorMessage(MIN_LENGTH_REQUIRED_MSG("calendar"))
            return
        }

        const fieldsNames = fields.reduce((acc, curr) => acc.concat(curr.id), [] as string[])
        const selectedCalsIndex = selected.map((val) => fieldsNames.indexOf(val))

        removeCalendarsFields(selectedCalsIndex)
        setSelected([])

        // update row heights for visualizing
        const rs = [...rowSizes]
        selectedCalsIndex.sort()
        selectedCalsIndex.forEach((index: number) => {
            rs.splice(index, 1)
        })

        setRowSizes(rs)
    };

    const handleClick = (calendarId: string) => {
        const selectedIndex = selected.indexOf(calendarId)
        let newSelected: readonly string[] = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, calendarId)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            )
        }

        setSelected(newSelected)
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelectedIds = fields.map((n) => n.id)
            setSelected(newSelectedIds)
            return
        }

        setSelected([])
    };

    const updateRowSizes = (index: number, timePeriodsCount: number) => {
        const rs = [
            ...rowSizes.slice(0, index),
            timePeriodsCount * ROW_HEIGHT,
            ...rowSizes.slice(index+1)            
        ]
        setRowSizes(rs)
    };

    const numSelected = selected.length
    const calendarsCount = fields.length

    const renderRow = (({ style, index, data }: any) => {
        const calendar = fields[index]
        const isItemSelected = selected.indexOf(calendar.id) !== -1

        return <TimePeriodTableRows
            key={`calendar_${index}_${calendar.key}`}
            formState={props.formState}
            index={index}
            isItemSelected={isItemSelected}
            handleClick={handleClick}
            style={style}
            updateRowSizes={updateRowSizes}
        />
    });

    const getItemSize = (index: number) => {
        return rowSizes[index]
    };
    
    return (
        <Grid container spacing={2}>
            <Toolbar
                sx={{
                    width: "100%",
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    ...(numSelected > 0 && {
                        bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                    }),
                }}>
                <Grid container>
                    <Grid item xs={6} justifyContent="flex-start">
                        {numSelected > 0 && (
                            <Typography
                                color="inherit"
                            >
                                {selected.length} calendar(s) selected
                            </Typography>
                        )}
                    </Grid>

                    <Grid item container justifyContent="flex-end" xs={6}>
                        {numSelected > 0
                            ? <DeleteButtonToolbar
                                onClick={onDeleteCalendars}
                                labelName="Delete"
                            />
                            : <AddButtonToolbar
                                onClick={onAddNewCalendar}
                                labelName="Add new calendar"
                            />
                        }
                    </Grid>
                </Grid>
            </Toolbar>

            <TableContainer component={Paper} style={{ width: "100%", height: "60vh"}}>
                <Table style={{ width: "100%", height: "60vh" }} >
                    <TableHead>
                        <TableRow>
                            <TableCell width={colWidth[0]} padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={numSelected > 0 && numSelected < calendarsCount}
                                    checked={calendarsCount > 0 && numSelected === calendarsCount}
                                    onChange={handleSelectAllClick}
                                />
                            </TableCell>
                            <TableCell width={colWidth[1]}>Name</TableCell>
                            <TableCell width={colWidth[2]}>Begin Day</TableCell>
                            <TableCell width={colWidth[3]}>End Day</TableCell>
                            <TableCell width={colWidth[4]}>Begin Time</TableCell>
                            <TableCell width={colWidth[5]}>End Time</TableCell>
                            <TableCell width={colWidth[6]}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{ height: "50vh" }} >
                        <AutoSizer>
                            {({ height, width }) => (
                                <VariableSizeList
                                    ref={listRef}
                                    width={width}
                                    height={height}
                                    itemSize={getItemSize}
                                    itemCount= {fields.length}
                                    itemData={fields}
                                    itemKey={(i: number) => fields[i].id}
                                >
                                    {renderRow}
                                </VariableSizeList>
                            )}
                        </AutoSizer>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default ResourceCalendars;
