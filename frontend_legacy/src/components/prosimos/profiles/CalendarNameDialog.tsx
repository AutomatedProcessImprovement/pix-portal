import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from "@mui/material";
import { useEffect, useState } from "react";

interface CalendarNameDialogProps {
    modalOpen: boolean
    handleClose: () => void
    handleSubmit: (name: string) => void
    dialogTitle?: string
    isDialogTextShown?: boolean
}

const CalendarNameDialog = (props: CalendarNameDialogProps) => {
    const [name, setName] = useState<string>("");
    const {modalOpen, handleClose, handleSubmit } = props
    const [title, setTitle] = useState<string>()
    const [isDialogContentTextShown, setIsDialogContentTextShown] = useState(true)

    useEffect(() => {
        if (props.dialogTitle !== undefined && title !== props.dialogTitle) {
            setTitle(props.dialogTitle)
        }
    }, [props.dialogTitle, title])

    useEffect(() => {
        if (props.isDialogTextShown !== undefined && isDialogContentTextShown !== props.isDialogTextShown) {
            setIsDialogContentTextShown(props.isDialogTextShown)
        }
    }, [props.isDialogTextShown, isDialogContentTextShown])

    return (
        <Dialog open={modalOpen} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{title ?? "Modify Calendar"}</DialogTitle>
            <DialogContent>
            {isDialogContentTextShown && <DialogContentText>
                You have changed the time periods for the existing calendar. Please, provide a name for the newly created calendar
                based on the filled time periods.
            </DialogContentText>}
            <TextField
                autoFocus
                label="Calendar Name"
                fullWidth
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => handleSubmit(name)}>Submit</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CalendarNameDialog;