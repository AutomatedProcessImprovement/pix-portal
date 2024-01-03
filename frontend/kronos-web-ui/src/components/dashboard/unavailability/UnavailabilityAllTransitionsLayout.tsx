import React, {useState} from 'react';
import {Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import {dhmToString} from "../../../helpers/dhmToString";
import {secondsToDhm} from "../../../helpers/SecondsToDhm";
import {useFetchData} from "../../../helpers/useFetchData";
import WaitingTimeframe from "../overview/WaitingTimeframe";
import TransitionsBarChart from "../overview/TransitionsBarChart";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ResourcesBarChart from "../ResourcesBarChart";


interface UnavailabilityAllTransitionsLayout {
    jobId: string;
}

const UnavailabilityAllTransitionsLayout: React.FC<UnavailabilityAllTransitionsLayout> = ({jobId}) => {
    const overviewData = useFetchData(`/wt_overview/${jobId}/unavailability`);
    const timeFrameData = useFetchData(`/daily_summary/${jobId}`);
    const activityWTTotal = useFetchData(`/activity_wt/${jobId}`);
    const activityWTAvg = useFetchData(`/activity_avg_wt/${jobId}`);
    const [dataMode2, setDataMode2] = useState("Average");
    const activityWT = dataMode2 === "Average" ? activityWTAvg : activityWTTotal;
    const activityResourceWT = useFetchData(`/activity_resource_wt/${jobId}`);
    const [dataMode, setDataMode] = useState("Average");
    const transitionsDataAverage = useFetchData(`/activity_transitions_average/${jobId}`);
    const transitionsDataTotal = useFetchData(`/activity_transitions/${jobId}`);
    const transitionsData = dataMode === "Average" ? transitionsDataAverage : transitionsDataTotal;
    const [selectedMode, setSelectedMode] = React.useState('Average');

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSelectedMode(event.target.value);
    };

    if (!overviewData || !transitionsData || !timeFrameData || !activityWT || !activityResourceWT) {
        return <div>Loading...</div>;
    }

    const caseFrequencyOptions = {
        chart: {
            height: 300,
        },
        title: {
            text: null
        },
        colors: ['#63B7B0', 'lightblue'],
        series: [{
            type: 'pie',
            data: [
                ['Affected', overviewData.distinct_cases],
                ['Not Affected', overviewData.cases - overviewData.distinct_cases]
            ]
        }],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
    };

    let wtValue: number;
    let otherCausesValue: number;

    if (selectedMode === 'Average') {
        wtValue = overviewData.avg_wt;
        otherCausesValue = overviewData.avg_total_wt;
    } else {
        wtValue = overviewData.wt_sum;
        otherCausesValue = overviewData.total_wt_sum;
    }

    const waitingTimeOptions = {
        chart: {
            height: 300,
        },
        title: {
            text: null
        },
        colors: ['#63B7B0', 'lightblue'],
        tooltip: {
            pointFormatter: function (this: any) {
                return `${this.series.name}: <b>${dhmToString(secondsToDhm(this.y))}</b>`;
            }
        },
        series: [{
            type: 'pie',
            data: [
                ['Resourse Unavailability', wtValue],
                ['Other Causes', otherCausesValue]
            ]
        }],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
    };

    // Setting up data for 'On Average'
    const avgBiggestSourceDestPair = `${overviewData.avg_biggest_source_dest_pair[1]} - ${overviewData.avg_biggest_source_dest_pair[0]}`;
    const avgValueText = dhmToString(secondsToDhm(overviewData.avg_biggest_source_dest_pair[2]));
    const avgHighestSourceText = overviewData.avg_biggest_resource[0];
    const avgHighestSourceValue = dhmToString(secondsToDhm(overviewData.avg_biggest_resource[1]));

    // Setting up data for 'In Total'
    const totalBiggestSourceDestPair = `${overviewData.biggest_source_dest_pair[1]} - ${overviewData.biggest_source_dest_pair[0]}`;
    const totalValueText = dhmToString(secondsToDhm(overviewData.biggest_source_dest_pair[2]));
    const totalHighestSourceText = overviewData.biggest_resource[0];
    const totalHighestSourceValue = dhmToString(secondsToDhm(overviewData.biggest_resource[1]));

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            m: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            mx: "5rem"
        }}>
            <Grid container
                  spacing={3}
                  flexGrow={1}
                  justifyContent="flex-start"
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"stretch"}
            >
                <Grid item xs={4}>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                    }}>
                        <div style={{fontWeight: 'bold', fontSize: '1.2em'}}>Affected Cases</div>
                        <div>{overviewData.distinct_cases} / {overviewData.cases}</div>
                        <div style={{width: '100%', height: '300px'}}>
                            <HighchartsReact highcharts={Highcharts} options={caseFrequencyOptions}/>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="h6" style={{ marginRight: '8px', display: 'inline' }}>
                                WT due to Unavailability
                            </Typography>
                            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                                <FormControl variant="outlined" size="small" style={{ width: '120px' }}>
                                    <InputLabel>Data Mode</InputLabel>
                                    <Select
                                        value={selectedMode}
                                        onChange={handleChange}
                                        label="Data Mode"
                                    >
                                        <MenuItem value={'Average'}>Average by case</MenuItem>
                                        <MenuItem value={'Total'}>Total</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        <div>
                            {wtValue === 0 ? "0" : dhmToString(secondsToDhm(wtValue))}
                        </div>

                        <div style={{ width: '100%', height: '300px' }}>
                            <HighchartsReact highcharts={Highcharts} options={waitingTimeOptions} />
                        </div>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                    }}>
                        <div style={{fontWeight: 'bold', fontSize: '1.2em', marginBottom: '35px'}}>Highest Source</div>

                        {/* On Average */}
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Average by transition</div>
                        <div style={{textAlign: 'left'}}>Transition: {avgBiggestSourceDestPair}</div>
                        <div style={{textAlign: 'left', marginBottom: '10px'}}>{avgValueText}</div>
                        <div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>Resource: {avgHighestSourceText}</div>
                        <div style={{textAlign: 'left', marginBottom: '35px', whiteSpace: 'pre-line'}}>{avgHighestSourceValue}</div>

                        {/* In Total */}
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Total</div>
                        <div style={{textAlign: 'left'}}>Transition: {totalBiggestSourceDestPair}</div>
                        <div style={{textAlign: 'left', marginBottom: '10px'}}>{totalValueText}</div>
                        <div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>Resource: {totalHighestSourceText}</div>
                        <div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{totalHighestSourceValue}</div>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Waiting time over the timeframe
                        </Typography>
                    </div>
                    <WaitingTimeframe
                        data={timeFrameData}
                        wtType={"unavailability"}
                    />
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" style={{ marginRight: '8px' }}>
                                Waiting time causes in transitions
                            </Typography>

                            <Tooltip
                                title={
                                    <span style={{ fontSize: '1rem' }}>
                        Waiting time between pairs of consecutive activities categorized by the causes of waiting.
                    </span>
                                }
                            >
                                <IconButton size="small" aria-label="info about waiting time causes">
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </div>

                        <FormControl variant="outlined">
                            <InputLabel>Data Mode</InputLabel>
                            <Select
                                value={dataMode}
                                onChange={(e) => setDataMode(e.target.value)}
                                label="Data Mode"
                            >
                                <MenuItem value={"Average"}>Average by transition</MenuItem>
                                <MenuItem value={"Total"}>Total</MenuItem>
                            </Select>
                        </FormControl>

                    </div>
                    <TransitionsBarChart data={transitionsData} selectedWTType={"unavailability"}/>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

                            <Typography variant="h6" style={{ marginRight: '8px' }}>
                                Sum of waiting times before activities
                            </Typography>

                            <Tooltip
                                title={
                                    <span style={{ fontSize: '1rem' }}>
                                The sum of all transitions (waiting times) incoming in each activity. Indicates which activities could be bottlenecks in the process.
                            </span>
                                }
                            >
                                <IconButton size="small" aria-label="info about waiting time causes">
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <FormControl variant="outlined">
                            <InputLabel>Data Mode</InputLabel>
                            <Select
                                value={dataMode2}
                                onChange={(e) => setDataMode2(e.target.value)}
                                label="Data Mode"
                            >
                                <MenuItem value={"Average"}>Average by activity</MenuItem>
                                <MenuItem value={"Total"}>Total</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <TransitionsBarChart data={activityWT} selectedWTType={"unavailability"}/>
                </Grid>
                <Grid item xs={12}>
                    <ResourcesBarChart data={activityResourceWT} selectedWt="unavailability" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default UnavailabilityAllTransitionsLayout;