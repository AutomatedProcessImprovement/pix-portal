import * as React from 'react';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Cloud from '@mui/icons-material/Cloud';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SpeedIcon from '@mui/icons-material/Speed';
import {Menu} from "@mui/material";

export interface ToolSelectionMenuProps {
  anchorEl: any;
  onClose: (e) => any;
  selectable: any
}


export default function ToolSelectionMenu(props: ToolSelectionMenuProps) {
  const {anchorEl, onClose, selectable} = props
  const open = Boolean(anchorEl)


  const handleClose = (e:string) => {
    onClose(e)
  };

  return (
      <Menu
        id="basic-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
      <MenuList>
        <MenuItem disabled={!selectable.SIMOD} onClick={() => handleClose("SIMOD")}>
          <ListItemIcon>
            <ContentPasteSearchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Simod - Discovery</ListItemText>
          {/*<Typography variant="body2" color="text.secondary">*/}
          {/*  ⌘X*/}
          {/*</Typography>*/}
        </MenuItem>
        <MenuItem disabled={!selectable.PROSIMOS} onClick={() => handleClose("PROSIMOS")}>
          <ListItemIcon>
            <WidgetsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Prosimos - Simulation</ListItemText>
          {/*<Typography variant="body2" color="text.secondary">*/}
          {/*  ⌘C*/}
          {/*</Typography>*/}
        </MenuItem>
        <MenuItem disabled={!selectable.OPTIMOS} onClick={() => handleClose("OPTIMOS")}>
          <ListItemIcon>
            <SpeedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Optimos - Optimisation</ListItemText>
          {/*<Typography variant="body2" color="text.secondary">*/}
          {/*  ⌘V*/}
          {/*</Typography>*/}
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Cloud fontSize="small" />
          </ListItemIcon>
          <ListItemText>OTHER STUFF?</ListItemText>
        </MenuItem>
      </MenuList>
      </Menu>
  );
}