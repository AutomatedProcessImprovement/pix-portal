import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';
import { useEffect, useState } from 'react';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface PixSnackBarProps {
  message: string
  onSnackbarClose: () => void
  severityLevel?: AlertColor
}

const PixSnackBar = (props: PixSnackBarProps) => {
  const { message, onSnackbarClose, severityLevel } = props
  const [open, setOpen] = useState(message !== "")
  const [alertMessage, setAlertMessage] = useState(message)
  const [severity, setSeverity] = useState(severityLevel || "error")

  useEffect(() => {
    if (severityLevel && severityLevel !== severity) {
      setSeverity(severityLevel)
    }
  }, [severityLevel, severity])

  useEffect(() => {
    if (alertMessage !== message) {
      setOpen(message !== "");
      setAlertMessage(message)
    }
  }, [message, alertMessage])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log(event)
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
    onSnackbarClose()
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {alertMessage}
      </Alert>
    </Snackbar>
  );
}

export default PixSnackBar;