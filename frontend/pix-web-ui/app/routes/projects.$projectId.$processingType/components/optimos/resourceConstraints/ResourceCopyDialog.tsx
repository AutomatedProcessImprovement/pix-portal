import { Person as PersonIcon } from "@mui/icons-material";

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState, type FC } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { ConsParams } from "~/shared/optimos_json_type";

export type ResourceCopyDialogProps = {
  open: boolean;
  onClose: (value: string[]) => void;
  selectedValue: string;
  allCalendars: ConsParams["resources"];
};

export const ResourceCopyDialog: FC<ResourceCopyDialogProps> = ({ onClose, selectedValue, open, allCalendars }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleClose = () => {
    onClose(selectedIds);
  };
  const handleCancel = () => {
    onClose([]);
  };

  const onSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <Dialog
      onClose={handleCancel}
      open={open}
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
    >
      <DialogTitle>Select Resources to apply constraints to</DialogTitle>
      <DialogContent>
        <List sx={{ pt: 0 }}>
          {allCalendars.map((calendar) => (
            <ListItem disableGutters key={calendar.id} disablePadding>
              <ListItemButton onClick={() => onSelect(calendar.id)} disabled={selectedValue === calendar.id}>
                <ListItemIcon>
                  <Checkbox
                    disabled={selectedValue === calendar.id}
                    edge="start"
                    checked={selectedValue === calendar.id || selectedIds.includes(calendar.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": `checkbox-list-label-${calendar.id}` }}
                  />
                </ListItemIcon>
                <ListItemText id={`checkbox-list-label-${calendar.id}`} primary={calendar.id} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedIds(allCalendars.map((calendar) => calendar.id))}>Select All</Button>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
