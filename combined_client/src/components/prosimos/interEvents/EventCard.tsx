import { useEffect } from 'react';
import { Card, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import TimeDistribution from "../distributions/TimeDistribution";
import { EventDistribution, JsonData } from "../formData";
import { EventsFromModel } from "../modelData";

interface EventCardProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
    eventsFromModel?: EventsFromModel
    index: number
    key: any
    style: any
    fields: FieldArrayWithId<JsonData, "event_distribution", "key">[]
}

const EventCard = (props: EventCardProps) => {
    const { formState: { formState: { errors } }, 
        setErrorMessage, eventsFromModel, key, style, fields } = props

    const [eventIndex, setEventIndex] = useState<number>(props.index)
    const [currentField, setCurrentField] = useState<EventDistribution>({} as EventDistribution)
    const [eventIdKey, setEventIdKey] = useState("")
    const [eventLabel, setEventLabel] = useState("")
    const [distrErrors, setDistrErrors] = useState({})

    useEffect(() => {
        if (props.index !== eventIndex)
            setEventIndex(props.index)
    }, [props.index])

    useEffect(() => {
        setCurrentField(fields[eventIndex])
    }, [eventIndex, fields])

    useEffect(() => {
        const newFieldEventId = currentField.event_id
        if (newFieldEventId !== eventIdKey) {
            setEventIdKey(currentField.event_id)
        }
    }, [currentField, eventIdKey])

    useEffect(() => {
        if (eventsFromModel && eventsFromModel.isKeyExisting(eventIdKey)) {
            // checking the edge case
            // double verifying that event with this id exists in the model
            // if yes, update the state with event label
            setEventLabel(eventsFromModel.getNameByKey(eventIdKey))
        }
    }, [eventsFromModel, eventIdKey])

    useEffect(() => {
        const currentErrors = errors?.event_distribution?.[eventIndex]
        const distrErrors = {
            distribution_name: currentErrors?.distribution_name,
            distribution_params: currentErrors?.distribution_params
        }

        setDistrErrors(distrErrors)
    }, [eventIndex, errors])


    return <Grid key={`${key}`} item xs={12} style={style}>
        <Card elevation={5} sx={{ m: 1, p: 1, minHeight: "190px" }}>
            <Grid container item xs={12} sx={{ p: 1}}>
                <Grid key={`${key}NameGrid`} item xs={12} sx={{ mb: 1 }} >
                    <Typography key={`${key}Name`} variant="h6" align="left">
                        {eventIdKey}
                    </Typography>
                    {eventLabel && <Typography variant="subtitle2" color="text.secondary">
                        Event Label: {eventLabel}
                    </Typography>}
                </Grid>
                <TimeDistribution
                    formState={props.formState}
                    objectNamePath={`event_distribution.${eventIndex}`}
                    errors={distrErrors}
                    setErrorMessage={setErrorMessage}
                />
            </Grid>
        </Card>
    </Grid>
}

export default EventCard;
