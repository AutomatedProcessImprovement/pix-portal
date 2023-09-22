import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import {DialogActions, DialogContent} from "@mui/material";


export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

export function OTPDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleClick = () => {
    navigator.clipboard.writeText(selectedValue)
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Your one-time password</DialogTitle>
      <DialogContent dividers>
        <Typography
        variant={'h5'}
        >
          {selectedValue}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClick}>Copy to clipboard</Button>
      </DialogActions>

    </Dialog>
  );
}