import { useEffect, useMemo, useState } from "react";
import yup from "../../../yup-extended";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, Grid, TextField, DialogActions, Button, MenuItem } from "@mui/material";
import CalendarNameDialog from "./CalendarNameDialog";
import { JsonData, ResourceCalendar } from "../formData";
import { UpdateResourceCalendarRequest } from "./ResourceProfilesTable";
import { defaultWorkWeekTimePeriod } from "../simulationParameters/defaultValues";
import TimePeriodGridItemsWithAdd from "../calendars/TimePeriodGridItemsWithAdd";
import { INVALID_TIME_FORMAT } from "../validationMessages";

export interface ModalInfo {
    poolIndex: number
    resourceIndex: number
    calendarId: string
}

interface ModifyCalendarDialogProps {
    openModal: boolean
    handleCloseModal: () => void
    handleSaveModal: (r: UpdateResourceCalendarRequest) => void
    detailModal: ModalInfo
    formState: UseFormReturn<JsonData, object>
}

const ModifyCalendarDialog = (props: ModifyCalendarDialogProps) => {
    const {
        openModal, handleCloseModal, handleSaveModal,
        formState: { getValues },
        detailModal: { resourceIndex, calendarId }
    } = props
    const [initialCalendarIndex, setInitialCalendarIndex] = useState<number>()
    const [currCalendarIndex, setCurrCalendarIndex] = useState<number>()
    const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean>(false)
    const allCalendars = getValues("resource_calendars")
    
    const resourceCalendarsValidationSchema = useMemo(() => (
        yup.object().shape({
            id: yup.string().required(),
            name: yup.string().required(),
            time_periods: yup.array()
                .of(
                    yup.object().shape({
                        from: yup.string(),
                        to: yup.string(),
                        beginTime: yup.string().timeFormat(INVALID_TIME_FORMAT),
                        endTime: yup.string().timeFormat(INVALID_TIME_FORMAT)
                    })
                )
        })
    ), []);

    useEffect(() => {
        const currCalendarIndex = allCalendars.findIndex((item) => item.id === calendarId)
        setCurrCalendarIndex(currCalendarIndex)
        setInitialCalendarIndex(currCalendarIndex)
    }, [calendarId, allCalendars])

    const currCalendar = (currCalendarIndex !== undefined) ? allCalendars[currCalendarIndex] : {}
    const formState = useForm<ResourceCalendar>({
        resolver: yupResolver(resourceCalendarsValidationSchema),
        mode: "onBlur", // validate on blur
        defaultValues: currCalendar
    })

    const {
        formState: { isDirty },
        control: modalFormControl, reset, getValues: getModalValues,
        trigger: triggerCalendarValidation
    } = formState

    useEffect(() => {
        const currCalendar = (currCalendarIndex !== undefined) ? allCalendars[currCalendarIndex] : {}
        reset(currCalendar)
    }, [currCalendarIndex, allCalendars, reset])

    const { fields: currTimePeriods, append, remove } = useFieldArray({
        keyName: 'key',
        control: modalFormControl,
        name: `time_periods`
    })

    const handleCalendarSelectChange = (event: any) => {
        const selectedCalendarIndex = event.target.value
        setCurrCalendarIndex(Number(selectedCalendarIndex))

        const newSelectedCalendar = allCalendars[selectedCalendarIndex]
        reset(newSelectedCalendar)
    }

    const onModalSave = async () => {
        const isValid = await triggerCalendarValidation()

        if (!isValid) {
            return
        }
        
        if (isDirty) {
            setIsNameDialogOpen(true)
        } else {
            handleSaveModal({
                isNew: false,
                calendar: getModalValues(),
                resourceListIndex: resourceIndex
            })
            handleCloseModal()
        }
    }

    const onModalClose = () => {
        // reset calendar to the default values
        if (initialCalendarIndex !== currCalendarIndex || isDirty) {
            setCurrCalendarIndex(initialCalendarIndex)
        }

        handleCloseModal()
    }

    const onNameDialogClose = () => {
        setIsNameDialogOpen(false)
    }

    const onNameDialogSave = (name: string) => {
        handleSaveModal({
            isNew: isDirty,
            calendar: {
                ...getModalValues(),
                name: name
            },
            resourceListIndex: resourceIndex
        })
        setIsNameDialogOpen(false)
        handleCloseModal()
    }

    const onTimePeriodRemove = (index: number) => {
        remove(index)
    };

    const onTimePeriodAdd = () => {
        append(defaultWorkWeekTimePeriod)
    };

    return (
        <Dialog open={openModal} onClose={handleCloseModal}
            PaperProps={{
                sx: {
                    minHeight: "60vh",
                    minWidth: "70vh"
                }
            }}
        >
            <DialogTitle>Modify calendar</DialogTitle>
            <DialogContent>
                <Grid container width="100%" spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Calendar"
                            variant="standard"
                            value={currCalendarIndex}
                            onChange={handleCalendarSelectChange}
                            select
                        >
                            {allCalendars.map((item, index) => (
                                <MenuItem
                                    key={`calendar_select_${index}`}
                                    value={index}
                                >
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <TimePeriodGridItemsWithAdd
                        fields={currTimePeriods}
                        formState={formState}
                        objectFieldNamePart={"time_periods"}
                        onTimePeriodRemove={onTimePeriodRemove}
                        onTimePeriodAdd={onTimePeriodAdd}
                    />
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onModalClose}>Cancel</Button>
                <Button onClick={onModalSave}>Save</Button>
            </DialogActions>
            {isNameDialogOpen && <CalendarNameDialog
                modalOpen={isNameDialogOpen}
                handleClose={onNameDialogClose}
                handleSubmit={onNameDialogSave}
            />}
        </Dialog>
    )
}

export default ModifyCalendarDialog;
