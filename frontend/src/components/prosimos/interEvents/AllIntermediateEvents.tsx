
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { AutoSizer, List } from "react-virtualized";
import { JsonData } from "../formData";
import { EventsFromModel } from "../modelData";
import EventCard from "./EventCard";
import NoItemsCard from "../emptyComponents/NoItemsCard";


interface AllIntermediateEventsProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
    eventsFromModel?: EventsFromModel
}

const AllIntermediateEvents = (props: AllIntermediateEventsProps) => {
    const [isAnyEvents, setIsAnyEvents] = useState(false)
    const { formState: { control: formControl },
        setErrorMessage, eventsFromModel } = props

    const { fields } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: 'event_distribution'
    })

    useEffect(() => {
        const isAny = fields.length > 0
        if (isAny !== isAnyEvents) {
            setIsAnyEvents(isAny)
        }
    }, [fields])

    const renderRow = ({ index, key, style }: any) => {
        return (
            <EventCard
                formState={props.formState}
                setErrorMessage={setErrorMessage}
                eventsFromModel={eventsFromModel}
                index={index}
                key={key}
                style={style}
                fields={fields}
            />)
    }

    return (!isAnyEvents
        ? <NoItemsCard
            noItemsTitle={"No intermediate events defined in the BPMN model"}
        />
        : <Grid item xs={12} container spacing={2}>
            <Grid item container xs={12} style={{ minHeight: "60vh" }}>
                <AutoSizer>
                    {({ width, height }) => {
                        return <List
                            width={width}
                            height={height}
                            rowHeight={215}
                            rowRenderer={renderRow}
                            rowCount={fields.length}
                            overscanRowCount={5}
                        />
                    }}
                </AutoSizer>
            </Grid>
        </Grid>
    )
}

export default AllIntermediateEvents;
