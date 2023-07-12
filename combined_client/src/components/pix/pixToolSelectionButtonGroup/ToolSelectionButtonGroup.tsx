import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SpeedIcon from '@mui/icons-material/Speed';

export interface ToolSelectionButtonGroupProps {
  onClose: (e:any) => any;
}

export default function ToolSelectionButtonGroup(props: ToolSelectionButtonGroupProps) {
  const {onClose} = props

  const handleClose = (e:string) => {
    onClose(e)
  };

  return (
    <Box
    >
      <ButtonGroup
        orientation="vertical"
        color="primary"
        aria-label="vertical contained button group"
        variant="contained"
        size="large"
        sx={{minWidth: '100%'}}
      >
        <Button key="SIMOD"
                fullWidth
                sx={{	display: 'flex', justifyContent: 'left'}}
                startIcon={<ContentPasteSearchIcon />}
                onClick={() =>handleClose("SIMOD")}>
          | Simod
        </Button>
        <Button key="PROSIMOS"
                fullWidth
                sx={{	display: 'flex', justifyContent: 'left'}}
                startIcon={<WidgetsIcon />}
                onClick={() =>handleClose("PROSIMOS")}>
          | Prosimos
        </Button>
        <Button key="OPTIMOS"
                fullWidth
                sx={{	display: 'flex', justifyContent: 'left'}}
                startIcon={<SpeedIcon />}
                onClick={() =>handleClose("OPTIMOS")}>
          | Optimos
        </Button>
      </ButtonGroup>
    </Box>
  );
}