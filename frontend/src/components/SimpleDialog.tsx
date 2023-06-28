import * as React from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import {DialogActions, DialogContent, DialogContentText} from "@mui/material";


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