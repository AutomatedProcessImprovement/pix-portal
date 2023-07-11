import { Grid } from "@mui/material";
import { FieldArrayPath, FieldArrayWithId } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import AddButtonBase from "../toolbar/AddButtonBase";
import TimePeriodGridItem from "./TimePeriodGridItem";
import { List, AutoSizer } from 'react-virtualized';
import { useEffect, useState, useRef } from "react";

interface TimePeriodGridItemsWithAddProps<FieldValues> {
    fields: FieldArrayWithId<FieldValues, FieldArrayPath<FieldValues>, "key">[]
    formState: UseFormReturn<FieldValues, object>
    objectFieldNamePart: keyof FieldValues
    onTimePeriodRemove: (index: number) => void
    onTimePeriodAdd: () => void
}

const TimePeriodGridItemsWithAdd = <FieldValues,>(props: TimePeriodGridItemsWithAddProps<FieldValues>) => {
    const { fields, objectFieldNamePart } = props
    const [isRowAdded, setIsRowAdded] = useState(false)
    const listRef = useRef<List>(null)

    const onTimePeriodAdd = () => {
        setIsRowAdded(true)
        props.onTimePeriodAdd()
    };

    useEffect(() => {
        if (isRowAdded) {
            if (listRef.current) {
                listRef.current.scrollToRow(fields.length)
            }
            setIsRowAdded(false)
        }
    }, [fields, isRowAdded]);

    const renderRow = ({ index, key, style }: any) => {
        const isWithoutDeleteButton = (fields.length === 1 && index === 0)
        const item = fields[index]

        return (
            <Grid item xs={12} key={`resource_calendar_${index}`} style={style}>
                <TimePeriodGridItem
                    key={item.key}
                    formState={props.formState}
                    objectFieldName={`${objectFieldNamePart}.${index}`}
                    isWithDeleteButton={!isWithoutDeleteButton}
                    timePeriodIndex={index}
                    onDelete={props.onTimePeriodRemove}
                />
            </Grid>
        )
    };

    return (
        <Grid item xs={12} container spacing={2}>
            <Grid item container xs={12} style={{ minHeight: "30vh" }}>
                <AutoSizer>
                    {({ width, height }) => {
                        return <List
                            ref={listRef}
                            width={width}
                            height={height}
                            rowHeight={70}
                            rowRenderer={renderRow}
                            rowCount={fields.length}
                            overscanRowCount={10}
                        />
                    }}
                </AutoSizer>
            </Grid>
            <Grid item xs={12}>
                <AddButtonBase
                    labelName="new time period"
                    onClick={onTimePeriodAdd}
                    tooltipText="Add new time period"
                />
            </Grid>
        </Grid>
    )
}

export default TimePeriodGridItemsWithAdd;
