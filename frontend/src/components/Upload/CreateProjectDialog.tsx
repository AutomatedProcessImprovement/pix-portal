import {
  Button,
  Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import {useRef} from "react";

export interface SimpleDialogProps {
  open: boolean;
  onSubmit:(type: string, value: string) => void;
  onClose: void;
  title: string,
  message: string,
  type: string,
  value: string
}

const CreateProjectDialog = (props: SimpleDialogProps) => {
  const { onSubmit, onClose, open, title, message, type, value } = props;
  const valueRef = useRef('')

  const sendValue = () => {
    // console.log(valueRef.current["value"])
    onSubmit(type, valueRef.current["value"])
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} onClose={onClose} open={open}>
      {/*<form onSubmit={onSubmit}>*/}
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project Name"
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