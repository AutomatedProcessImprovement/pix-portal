import { useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { List, AutoSizer } from 'react-virtualized';
import DistributionMappingRow from "./DistributionMappingRow";
import { JsonData } from "../formData";
import { AllowedDistrParamsName } from "./DistributionSection"


interface DistributionMappingWithAddProps {
    formState: UseFormReturn<JsonData, object>
    objectFieldNamePart: AllowedDistrParamsName
    valueLabel: string
    isRowAdded: boolean
    setIsRowAdded: any
    fields: FieldArrayWithId<JsonData, AllowedDistrParamsName>[]
    remove: any
    keyTextFieldProps: { label: string, type: string }
}

const DistributionMappingWithAdd = (props: DistributionMappingWithAddProps) => {
    const { formState, objectFieldNamePart, valueLabel,
        isRowAdded, setIsRowAdded, fields, remove } = props
    const listRef = useRef<List>(null)

    const onRowDelete = (index: number) => {
        remove(index)
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
        const uniqueKey = fields[index].id

        return (
            <Grid item xs={12} key={key} style={style}>
                <DistributionMappingRow
                    key={uniqueKey}
                    formState={formState}
                    objectFieldName={`${objectFieldNamePart}.${index}`}
                    isWithDeleteButton={!isWithoutDeleteButton}
                    rowIndex={index}
                    onDelete={onRowDelete}
                    valueLabel={valueLabel}
                    keyTextFieldProps={props.keyTextFieldProps}
                />
            </Grid>
        )
    };

    return (
        <Grid item xs={12} container spacing={2}>
            <Grid item container xs={12} style={{ minHeight: "20vh" }}>
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
        </Grid>
    )
}

export default DistributionMappingWithAdd;
