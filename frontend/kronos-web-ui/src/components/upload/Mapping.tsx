import * as React from 'react';
import {useState} from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {AlertColor, Button, DialogActions, DialogContent, DialogContentText} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import CustomizedSnackbar from '../CustomizedSnackBar';

export interface SimpleDialogProps {
    open: boolean;
    selectedValue: string[];
    onClose: (cancel: boolean, values: object) => void;
}

export default function MappingDialog(props: SimpleDialogProps) {
    const {onClose, selectedValue, open} = props;
    const [snackMessage, setSnackMessage] = useState("");
    const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined);
    const [currentMapping, setCurrentMapping] = useState<string[]>(Array(selectedValue.length).fill(""));

    const handleChange = (e: SelectChangeEvent, index: number) => {
        const newMapping = [...currentMapping];
        newMapping[index] = e.target.value as string;
        setCurrentMapping(newMapping);
    };

    const setErrorMessage = (value: string) => {
        setSnackColor("error");
        setSnackMessage(value);
    };

    const onSnackbarClose = () => {
        setErrorMessage("");
    };

    const handleClose = (cancel: boolean) => {
        if (cancel) {
            onClose(cancel, selectedValue);
            return;
        }

        const counts: { [key: string]: number } = {};
        currentMapping.forEach((val) => {
            counts[val] = (counts[val] || 0) + 1;
        });

        const requiredFields = ['case', 'activity', 'start_timestamp', 'end_timestamp', 'resource'];
        const missingFields = requiredFields.filter(field => !counts[field] || counts[field] < 1);
        const duplicateFields = requiredFields.filter(field => counts[field] && counts[field] > 1);

        if (missingFields.length > 0) {
            setErrorMessage('Each type must be assigned at least once. Please adjust the mapping and try again.');
            return;
        }

        if (duplicateFields.length > 0) {
            setErrorMessage('Each type can only be assigned once. Please adjust the mapping and try again.');
            return;
        }

        const mapping_object = {
            'case': selectedValue[currentMapping.indexOf('case')],
            'activity': selectedValue[currentMapping.indexOf('activity')],
            'start_timestamp': selectedValue[currentMapping.indexOf('start_timestamp')],
            'end_timestamp': selectedValue[currentMapping.indexOf('end_timestamp')],
            'resource': selectedValue[currentMapping.indexOf('resource')],
        };

        onClose(cancel, mapping_object);
    };

    return (
        <Dialog onClose={() => handleClose(true)} open={open}>
            <DialogTitle>Map the event log</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Here you can assign the right column names to each column for processing.
                </DialogContentText>
                <List>
                    {selectedValue.map((columnName, index) => (
                        <ListItem key={columnName}>
                            <ListItemText primary={columnName}/>
                            <FormControl sx={{m: 1, minWidth: 250}}>
                                <InputLabel id="demo-simple-select-helper-label">Type</InputLabel>
                                <Select
                                    id={columnName}
                                    label="Type"
                                    defaultValue={""}
                                    onChange={(e) => handleChange(e, index)}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={"case"}>Case ID</MenuItem>
                                    <MenuItem value={"activity"}>Activity</MenuItem>
                                    <MenuItem value={"start_timestamp"}>Start Timestamp</MenuItem>
                                    <MenuItem value={"end_timestamp"}>End Timestamp</MenuItem>
                                    <MenuItem value={"resource"}>Resource</MenuItem>
                                    <MenuItem value={"other"}>Other</MenuItem>
                                </Select>
                            </FormControl>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(true)}>Cancel</Button>
                <Button onClick={() => handleClose(false)} autoFocus>
                    Continue
                </Button>
            </DialogActions>
            {snackMessage && <CustomizedSnackbar
                message={snackMessage}
                severityLevel={snackColor}
                onSnackbarClose={onSnackbarClose}
            />}
        </Dialog>
    );
}
