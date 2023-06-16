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
  onSubmit:(value: string) => void;
  onClose: void;
}

const CreateProjectDialog = (props: SimpleDialogProps) => {
  const { onSubmit, onClose, open } = props;
  const valueRef = useRef('')

  const sendValue = () => {
    // console.log(valueRef.current["value"])
    onSubmit(valueRef.current["value"])
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} onClose={onClose} open={open}>
      {/*<form onSubmit={onSubmit}>*/}
        <DialogTitle>Create a new project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the project.
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={sendValue} autoFocus>
            Create
          </Button>
        </DialogActions>
    </Dialog>
  );
}

export default CreateProjectDialog