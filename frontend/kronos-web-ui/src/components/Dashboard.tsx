import React, {useEffect, useState, Suspense} from 'react';
import axios from 'axios';
import {useLocation} from 'react-router-dom';
import {useFetchData} from '../helpers/useFetchData';
import {
    Box,
    Button,
    ButtonGroup,
    ClickAwayListener,
    FormControl,
    Grid,
    Grow,
    InputLabel,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Select,
    Tab,
    Tabs,
    Tooltip
} from '@mui/material';
import {SelectChangeEvent} from "@mui/material/Select";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Download from '@mui/icons-material/CloudDownloadOutlined';

const Overview = React.lazy(() => import('./dashboard/overview/Overview'));
const Batching = React.lazy(() => import('./dashboard/batching/Batching'));
const Prioritization = React.lazy(() => import('./dashboard/prioritization/Prioritization'));
const Contention = React.lazy(() => import('./dashboard/contention/Contention'));
const Unavailability = React.lazy(() => import('./dashboard/unavailability/Unavailability'));
const Extraneous = React.lazy(() => import('./dashboard/extraneous/Extraneous'));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ActivityPair {
    destination_activity: string;
    source_activity: string;
}

const useFetchActivityPairs = (jobId: string) => {
    const [activityPairs, setActivityPairs] = useState<ActivityPair[]>([]);
    const fetchedData = useFetchData(`/activity_pairs/${jobId}`);

    useEffect(() => {
        if (fetchedData) {
            setActivityPairs(fetchedData);
        }
    }, [fetchedData]);

    return activityPairs;
};

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    const isHidden = value !== index;

    return (
        <div
            role="tabpanel"
            hidden={isHidden}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box sx={{ p: 3, display: isHidden ? 'none' : 'block' }}>
                {children}
            </Box>
        </div>
    );
}


function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ActivityPairSelector = ({selectedActivityPair, handleActivityPairChange, activityPairs}: any) => (
    <FormControl variant="outlined" size="small">
        <InputLabel htmlFor="activity-pair-selector">Activity Pair</InputLabel>
        <Select
            label="Activity Pair"
            id="activity-pair-selector"
            value={selectedActivityPair}
            onChange={handleActivityPairChange}
        >
            <MenuItem value="All transitions">All transitions</MenuItem>
            {activityPairs.map((pair: ActivityPair, index: number) => (
                <MenuItem key={index} value={`${pair.source_activity} - ${pair.destination_activity}`}>
                    {`${pair.source_activity} - ${pair.destination_activity}`}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

const onDownload = (type: number, jobId: string) => {
    switch (type) {
        case 0:
            window.location.href = `http://193.40.11.233/assets/results/${jobId}/event_log_transitions_report.csv`;
            break;
        case 1:
            axios({
                url: `http://193.40.11.233/assets/results/${jobId}/event_log_transitions_report.json`,
                method: 'GET',
                responseType: 'blob'
            }).then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'event_log_transitions_report.json');
                document.body.appendChild(link);
                link.click();
            });
            break;
        default:
            break;
    }
};


const options = ['Download as CSV', 'Download as JSON'];

const BasicTabs = () => {
    const [value, setValue] = useState(0);
    const [open, setOpen] = useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedActivityPair, setSelectedActivityPair] = useState<string>('All transitions');
    const {state} = useLocation();
    const {jobId} = state as { jobId: string };
    const activityPairsData = useFetchActivityPairs(jobId);

    if (!activityPairsData) {
        return <div>Loading...</div>;
    }
    const activityPairs = activityPairsData;

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleActivityPairChange = (event: SelectChangeEvent) => {
        setSelectedActivityPair(event.target.value as string);
    };

    const sortedActivityPairs = [...activityPairs].sort((a, b) => {
        const nameA = `${a.source_activity} - ${a.destination_activity}`;
        const nameB = `${b.source_activity} - ${b.destination_activity}`;
        return nameA.localeCompare(nameB);
    });

    const handleClick = () => {
        onDownload(0, jobId)
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
        setOpen(false);
        onDownload(index, jobId)
    };

    return (
        <Box sx={{width: '100%', mt: 1, zIndex: 100000}}>
            <Box>
                <Grid
                    container
                    spacing={3}
                    alignItems={"stretch"}
                    justifyContent="space-around"
                    direction="row"
                >

                    <Grid item>
                        {/* Activity Pair Selector */}
                        <ActivityPairSelector
                            selectedActivityPair={selectedActivityPair}
                            handleActivityPairChange={handleActivityPairChange}
                            activityPairs={sortedActivityPairs}
                        />
                    </Grid>
                    <Grid item>
                        <Tabs value={value} onChange={handleChange} aria-label=" ">
                            <Tab label="Overview" {...a11yProps(0)} />
                            <Tab label="Batching" {...a11yProps(1)} />
                            <Tab label="Prioritization" {...a11yProps(2)} />
                            <Tab label="Resource Contention" {...a11yProps(3)} />
                            <Tab label="Resource Unavailability" {...a11yProps(4)} />
                            <Tab label="Extraneous Factors" {...a11yProps(5)} />
                        </Tabs>
                    </Grid>
                    <Grid item>
                        <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button"
                                     sx={{zIndex: 100000}}>
                            <Tooltip title={'Download as CSV'}>
                                <Button size="small"
                                        aria-controls={open ? 'split-button-menu' : undefined}
                                        aria-expanded={open ? 'true' : undefined}
                                        aria-label="select merge strategy"
                                        aria-haspopup="menu"
                                        onClick={handleClick}>

                                    <Download/>
                                </Button>
                            </Tooltip>
                            <Button
                                size="small"
                                aria-controls={open ? 'split-button-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-label="select merge strategy"
                                aria-haspopup="menu"
                                onClick={handleToggle}
                            >
                                <ArrowDropDownIcon/>
                            </Button>
                        </ButtonGroup>
                        <Popper
                            open={open}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            transition
                            disablePortal={false}
                            sx={{zIndex: 100000}}
                            style={{zIndex: 100000}}
                        >
                            {({TransitionProps, placement}) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === 'bottom' ? 'center top' : 'center bottom',
                                        zIndex: 100000
                                    }}

                                >
                                    <Paper sx={{zIndex: 100000}}>
                                        <ClickAwayListener onClickAway={handleClose} sx={{zIndex: 100000}}>
                                            <MenuList id="split-button-menu" autoFocusItem sx={{zIndex: 100000}}>
                                                {options.map((option, index) => (
                                                    <MenuItem
                                                        key={option}
                                                        disabled={index === 2}
                                                        selected={index === selectedIndex}
                                                        onClick={(event) => handleMenuItemClick(event, index)}
                                                        sx={{zIndex: 100000}}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Grid>
                </Grid>

            </Box>
            <Suspense fallback={<div>Loading...</div>}>
                {value === 0 && (
                    <TabPanel value={value} index={0}>
                        <Overview jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
                {value === 1 && (
                    <TabPanel value={value} index={1}>
                        <Batching jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
                {value === 2 && (
                    <TabPanel value={value} index={2}>
                        <Prioritization jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
                {value === 3 && (
                    <TabPanel value={value} index={3}>
                        <Contention jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
                {value === 4 && (
                    <TabPanel value={value} index={4}>
                        <Unavailability jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
                {value === 5 && (
                    <TabPanel value={value} index={5}>
                        <Extraneous jobId={jobId} selectedActivityPair={selectedActivityPair} />
                    </TabPanel>
                )}
            </Suspense>
        </Box>
    );
}


export default BasicTabs