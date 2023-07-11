import { Grid, MenuItem, TextField, Typography } from "@mui/material"
import { useState, useEffect } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import TimePeriodGridItemsWithAdd from "./calendars/TimePeriodGridItemsWithAdd"
import { JsonData } from './formData'
import { defaultTemplateSchedule } from './simulationParameters/defaultValues'
import { MIN_LENGTH_REQUIRED_MSG } from './validationMessages'
import { defaultWorkWeekTimePeriod } from "./simulationParameters/defaultValues";
import DeleteButtonToolbar from "./toolbar/DeleteButtonToolbar"
import AddButtonToolbar from "./toolbar/AddButtonToolbar"
import CalendarNameDialog from "./profiles/CalendarNameDialog"
import { useSharedStyles } from "./sharedHooks/useSharedStyles"
import { collectAllAssignedCalendars } from "./calendars/assignedCalendarsCollector"


interface ResourceCalendarsProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const ResourceCalendars = (props: ResourceCalendarsProps) => {
    const classes = useSharedStyles()
    const { formState: { control: formControl, getValues }, formState, setErrorMessage } = props
    const [currCalendarIndex, setCurrCalendarIndex] = useState<number>()
    const [currCalendarKey, setCurrCalendarKey] = useState<string>("")
    const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean>(false)
    const [assignedCalendars, setAssignedCalendars] = useState<Set<string>>(new Set())

    const { fields: allCalendars, prepend: prependCalendarFields, remove: removeCalendarsFields } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: "resource_calendars"
    })

    const onNameDialogOpen = () => {
        setIsNameDialogOpen(true)
    };

    useEffect(() => {
        const usedCalendars = collectAllAssignedCalendars(getValues("resource_profiles"))
        if (usedCalendars !== assignedCalendars) {
            setAssignedCalendars(usedCalendars)
        }
    }, [])

    useEffect(() => {
        // once we get the new number of calendars, we:
        // either created a new one and redirect users to this newly created resource
        // or loading the page for the first time and select the first calendar in the list as an active one
        setCurrCalendarIndex(0)
    }, [allCalendars])

    useEffect(() => {
        // once index of the selected calendar changed,
        // we need to update the key accordingly
        updateCurrKey(currCalendarIndex)
    }, [currCalendarIndex])

    const onDeleteCalendars = () => {
        if (currCalendarIndex === undefined) {
            setErrorMessage("Calendar is not selected")
            return
        }

        if (allCalendars.length === 1) {
            setErrorMessage(MIN_LENGTH_REQUIRED_MSG("calendar"))
            return
        }

        const calendarName = getValues(`resource_calendars.${currCalendarIndex}.name`)
        if (assignedCalendars.has(calendarName)) {
            setErrorMessage("Calendar is assigned to one or many resources. Remove those assignments first")
            return
        }

        removeCalendarsFields(currCalendarIndex)
        updateCurrCalendar(undefined)
    };

    const onNameDialogSave = (name: string) => {
        // nullify selected option
        updateCurrCalendar(undefined)

        // add new calendar as the first one in the list
        const newDefaultResourceCalendar = defaultTemplateSchedule(false, name)
        prependCalendarFields(newDefaultResourceCalendar)

        onNameDialogClose()
    };

    const onNameDialogClose = () => {
        setIsNameDialogOpen(false)
    };

    const handleCalendarSelectChange = (event: any) => {
        const selectedCalendarIndex = event.target.value
        updateCurrCalendar(Number(selectedCalendarIndex))
    }

    const updateCurrCalendar = (index?: number) => {
        // update index
        setCurrCalendarIndex(index)

        // update key
        updateCurrKey(index)
    }

    const updateCurrKey = (currIndex?: number) => {
        if (currIndex === undefined) {
            setCurrCalendarKey("")
        } else {
            const calendarKey = allCalendars[currIndex]?.key || ""
            setCurrCalendarKey(calendarKey)
        }
    }

    return (
        <Grid container width="100%" spacing={2}>
            <Grid container item xs={12}>
                <Grid container item xs={8} className={classes.centeredGrid}>
                    <Grid item xs={8}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Calendar"
                            variant="standard"
                            value={currCalendarIndex ?? ''}
                            onChange={handleCalendarSelectChange}
                            select
                        >
                            {allCalendars.map((item, index) => {
                                const { key } = item
                                return <MenuItem
                                    key={`calendar_select_${key}`}
                                    value={index}
                                >
                                    {item.name}
                                </MenuItem>
                            })}
                        </TextField>
                    </Grid>
                </Grid>
                <Grid item xs={2} className={classes.centeredGrid}>
                    <DeleteButtonToolbar
                        onClick={onDeleteCalendars}
                        labelName="Delete selected"
                    />
                </Grid>
                <Grid item xs={2} className={classes.centeredGrid}>
                    <AddButtonToolbar
                        onClick={onNameDialogOpen}
                        labelName="new calendar"
                        variant="text"
                        tooltipText="Add new calendar"
                    />
                </Grid>
            </Grid>
            {(currCalendarIndex === undefined)
                ? <Grid item xs={12} className={classes.centeredGrid} sx={{ p: 2 }}>
                    <Typography>
                        Please select the calendar to see its time periods
                    </Typography>
                </Grid>
                : <Grid item xs={12} sx={{ p: 2 }}>
                    <TimePeriodList
                        key={`resource_calendars.${currCalendarKey}`}
                        formState={formState}
                        setErrorMessage={setErrorMessage}
                        calendarIndex={currCalendarIndex}
                        calendarKey={currCalendarKey}
                    />
                </Grid>
            }
            {isNameDialogOpen && <CalendarNameDialog
                modalOpen={isNameDialogOpen}
                handleClose={onNameDialogClose}
                handleSubmit={onNameDialogSave}
                dialogTitle="Create Calendar"
                isDialogTextShown={false}
            />}
        </Grid>
    )
}

interface TimePeriodListProps extends ResourceCalendarsProps {
    calendarIndex: number
    calendarKey: string
}

const TimePeriodList = (props: TimePeriodListProps) => {
    const { formState, calendarIndex, calendarKey } = props
    const { control } = formState
    const [index, setIndex] = useState<number>(calendarIndex)

    const { fields: currTimePeriods, append, remove } = useFieldArray({
        keyName: 'key',
        control: control,
        name: `resource_calendars.${index}.time_periods`
    })

    useEffect(() => {
        if (index !== calendarIndex) {
            setIndex(calendarIndex)
        }
    }, [calendarIndex, index])

    const onTimePeriodRemove = (index: number) => {
        remove(index)
    };

    const onTimePeriodAdd = () => {
        append(defaultWorkWeekTimePeriod)
    };

    return <TimePeriodGridItemsWithAdd
        key={`resource_calendars.${calendarKey}.time_periods`}
        fields={currTimePeriods}
        formState={formState}
        objectFieldNamePart={`resource_calendars.${calendarIndex}.time_periods` as unknown as keyof JsonData}
        onTimePeriodRemove={onTimePeriodRemove}
        onTimePeriodAdd={onTimePeriodAdd}
    />
}

export default ResourceCalendars;
