import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Table, TableHead, TableRow, TableCell, TableBody, Toolbar } from "@mui/material";

import AddButtonToolbar from "../toolbar/AddButtonToolbar";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { CalendarMap, JsonData, ResourceCalendar } from "../formData";
import ModifyCalendarDialog, { ModalInfo } from "./ModifyCalendarDialog";
import { AutoSizer } from "react-virtualized";
import { FixedSizeList } from "react-window";
import ResourceProfilesTableRow from "./ResourceProfilesTableRow";

export const colWidth = ["55%", "15%", "15%", "15%"]

export interface UpdateResourceCalendarRequest {
    isNew: boolean
    calendar: ResourceCalendar
    resourceListIndex: number
}

interface ResourceProfilesTableProps {
    poolUuid: string
    resourcePoolIndex: number
    formState: UseFormReturn<JsonData, object>
    errors: any
    calendars: CalendarMap
    setErrorMessage: (value: string) => void
    onResourceListCountChange: (count: number) => void
}

const ResourceProfilesTable = (props: ResourceProfilesTableProps) => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [detailModal, setDetailModal] = useState<ModalInfo>()
    const [isRowAdding, setIsRowAdding] = useState<boolean>(false)

    const {
        formState: { control: formControl, trigger, setValue, getValues, setFocus },
        resourcePoolIndex, calendars, errors, setErrorMessage
    } = props

    const { fields, prepend, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `resource_profiles.${resourcePoolIndex}.resource_list`
    });

    const { append: appendCalendar } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: "resource_calendars"
    });

    useEffect(() => {
        if (isRowAdding) {
            setFocus(`resource_profiles.${resourcePoolIndex}.resource_list.1.name`)
            setIsRowAdding(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields, isRowAdding])

    const onResourceProfileDelete = (index: number) => {
        // TODO: after deleting, the table is scrolled to the first row (this behavior is not desired)
        if (fields.length === 1) {
            setErrorMessage("At least one resource should be provided")
            return
        }

        const removedAmount = -fields[index].amount
        remove(index)
        props.onResourceListCountChange(removedAmount)
    };

    const getIdForNewResource = (poolUuid: string, lastElem: any) => {
        let nextResourceNum = 1
        let [lastResource] = lastElem

        if (lastResource) {
            const lastResourceId = lastResource.id
            nextResourceNum = Number(Number(lastResourceId.split('_').pop()!) + 1)
        }

        return poolUuid + "_" + nextResourceNum
    };

    const onProfileAdd = async () => {
        if ((errors?.length > 0 && errors?.type !== "min") || (errors?.length > 1 && errors?.type === "min")) {
            setErrorMessage("Verify the correctness of all entered Resource Profiles")
            return
        }

        prepend({
            id: getIdForNewResource(props.poolUuid, fields.slice(-1)),
            name: "",
            cost_per_hour: 0,
            amount: 1,
            calendar: Object.keys(calendars)[0]
        })

        setIsRowAdding(true)

        if (errors?.type === "min")
            trigger('resource_profiles')
    };

    const handleCloseModal = () => {
        setOpenModal(false)
    };

    const handleSaveModal = (r: UpdateResourceCalendarRequest) => {
        let calendarId = ""

        if (r.isNew) {
            const calendar = {
                ...r.calendar,
                id: "sid-" + uuid()
            }
            appendCalendar(calendar)
            calendarId = calendar.id
        } else {
            calendarId = r.calendar.id
        }

        setValue(
            `resource_profiles.${resourcePoolIndex}.resource_list.${r.resourceListIndex}.calendar`,
            calendarId,
            { shouldDirty: true }
        )
    };

    const onViewCalendarClick = (resourcePoolIndex: number, index: number) => {
        setDetailModal({
            poolIndex: resourcePoolIndex,
            resourceIndex: index,
            calendarId: getValues(`resource_profiles.${resourcePoolIndex}.resource_list.${index}.calendar`)
        })
        setOpenModal(true)
    }

    return (
        <React.Fragment>
            <Toolbar sx={{ justifyContent: "flex-end", marginLeft: "auto" }}>
                <AddButtonToolbar
                    labelName="new profile"
                    onClick={onProfileAdd}
                    tooltipText="Add new profile"
                />
            </Toolbar>
            <Table size="small" style={{ width: "90%", height: "35vh", margin: "auto" }}>
                <TableHead>
                    <TableRow>
                        <TableCell width={colWidth[0]}>Resource Profile</TableCell>
                        <TableCell width={colWidth[1]}>Cost per hour</TableCell>
                        <TableCell width={colWidth[2]}>Amount</TableCell>
                        <TableCell width={colWidth[3]}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody style={{ height: "30vh" }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <FixedSizeList
                                width={width}
                                height={height}
                                itemSize={80}
                                itemCount={fields.length}
                                itemData={fields}
                                itemKey={(i: number) => fields[i].key}
                                overscanCount={2}
                            >
                                {({ style, index, data }: any) => (
                                    <ResourceProfilesTableRow
                                        index={index}
                                        resourcePoolIndex={resourcePoolIndex}
                                        style={style}
                                        formState={props.formState}
                                        errors={errors}
                                        onResourceListCountChange={props.onResourceListCountChange}
                                        onResourceProfileDelete={onResourceProfileDelete}
                                        onViewCalendarClick={onViewCalendarClick}
                                    />
                                )}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                </TableBody>
            </Table>
            {detailModal && <ModifyCalendarDialog
                openModal={openModal}
                handleCloseModal={handleCloseModal}
                handleSaveModal={handleSaveModal}
                detailModal={detailModal}
                formState={props.formState}
            />}
        </React.Fragment>
    );
}

export default ResourceProfilesTable;
