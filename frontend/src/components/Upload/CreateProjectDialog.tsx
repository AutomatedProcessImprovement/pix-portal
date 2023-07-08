import {
  Button,
  Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import {useEffect, useRef, useState} from "react";

export interface SimpleDialogProps {
  open: boolean;
  onSubmit:(type: string, value: any) => void;
  onClose: () => void;
  title: string,
  message: string,
  type: string,
  value: string
}

const CreateProjectDialog = (props: SimpleDialogProps) => {
  const { onSubmit, onClose, open, title, message, type, value } = props;
  const valueRef = useRef<any>('')
  const [label, setLabel] = useState<any>('')

  useEffect(() => {
    switch (type) {
      case "ADD":
        setLabel("Project name")
        break
      case "EDIT":
        setLabel("Project name")
        break
      case "FILE":
        setLabel("File name")
        break
    }
  }, [type])

  const sendValue = () => {
    onSubmit(type, valueRef.current["value"])
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} onClose={onClose} open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={label}
            type="text"
            fullWidth
            variant="standard"
            inputRef={valueRef}
            defaultValue={value}
          />
        </DialogContent>
        <DialogActions>
          <Button color='error' variant="contained" onClick={onClose}>Cancel</Button>
          <Button  color="primary" variant="contained" onClick={sendValue} autoFocus>
            Create
          </Button>
        </DialogActions>
    </Dialog>
  );
}

export default CreateProjectDialog