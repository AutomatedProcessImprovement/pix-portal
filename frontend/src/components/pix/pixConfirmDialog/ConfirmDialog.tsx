import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
export interface SimpleDialogProps {
  open: boolean;
  title: string
  message: string;
  onClose: (e:any) => any;
}

const ConfirmDialog = (props: SimpleDialogProps) => {
  const { onClose, message, open, title } = props;

  const onClickClose = (e:boolean) => {
    onClose(e)
  }


  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={() => {onClickClose(false)}}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color='error' variant="contained" onClick={() => {onClickClose(false)}}>
          Cancel
        </Button>
        <Button color="primary" variant="contained" onClick={() => {onClickClose(true)}}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;