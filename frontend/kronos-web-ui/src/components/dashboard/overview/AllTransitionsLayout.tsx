import React, {useState} from 'react';
import {Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Infobox from "../Infobox";
import PieChartBox from "../PieChartBox";
import WaitingTimeframe from "./WaitingTimeframe";
import TransitionsBarChart from "./TransitionsBarChart";
import TransitionsTable from "./TransitionsTable";
import {secondsToDhm} from '../../../helpers/SecondsToDhm';
import {dhmToString} from '../../../helpers/dhmToString';
import {useFetchData} from '../../../helpers/useFetchData'
import GaugeChart from './GaugeChart';
import PotentialCteChart from './PotentialCteChart';
import CTEHeatmap from "./CTEHeatmap";
import CTETable from "./CTETable";
import Chat from "./Chat";

interface AllTransitionsLayoutProps {
    jobId: string;
}

const AllTransitionsLayout: React.FC<AllTransitionsLayoutProps> = ({jobId}) => {
    const overviewData = useFetchData(`/overview/${jobId}`);
    const potentialCteData = useFetchData(`/potential_cte/${jobId}`);
    const cteTableData = useFetchData(`/cte_improvement/${jobId}`);
    const timeframeData = useFetchData(`/daily_summary/${jobId}`);
    const [showTable, setShowTable] = useState(false);
    const [showTable2, setShowTable2] = useState(false);
    const [displayMode, setDisplayMode] = useState("average");
    const [pieChartDisplayMode, setPieChartDisplayMode] = useState("average");
    const [dataMode, setDataMode] = useState("AverageC");
    const transitionsDataAvgTransition = useFetchData(`/activity_transitions_average/${jobId}`);
    const transitionsDataTotal = useFetchData(`/activity_transitions/${jobId}`);
    const transitionsDataAvgCase = useFetchData(`/activity_transitions_average_case/${jobId}`);
    let transitionsData;

    if (dataMode === "AverageC") {
        transitionsData = transitionsDataAvgCase;
    } else if (dataMode === "AverageT") {
        transitionsData = transitionsDataAvgTransition;
    } else {
        transitionsData = transitionsDataTotal;
    }


    if (!overviewData || !transitionsData || !cteTableData || !potentialCteData || !timeframeData) {
        return <div>Loading...</div>;
    }

    const toggleTable = () => setShowTable(!showTable);
    const toggleTable2 = () => setShowTable2(!showTable2);

    if (!overviewData || !transitionsData) {
        return <div>Loading...</div>;
    }

    const visData = pieChartDisplayMode === "total"
        ? [
            {
                name: 'Extraneous',
                value: overviewData.sums.total_extraneous_wt,
                label: "EXTRANEOUS\n" + dhmToString(secondsToDhm(overviewData.sums.total_extraneous_wt))
            },
            {
                name: 'Batching',
                value: overviewData.sums.total_batching_wt,
                label: "BATCHING\n" + dhmToString(secondsToDhm(overviewData.sums.total_batching_wt))
            },
            {
                name: 'Resource Unavailability',
                value: overviewData.sums.total_unavailability_wt,
                label: "UNAVAILABILITY\n" + dhmToString(secondsToDhm(overviewData.sums.total_unavailability_wt))
            },
            {
                name: 'Resource Contention',
                value: overviewData.sums.total_contention_wt,
                label: "CONTENTION\n" + dhmToString(secondsToDhm(overviewData.sums.total_contention_wt))
            },
            {
                name: 'Prioritization',
                value: overviewData.sums.total_prioritization_wt,
                label: "PRIORITIZATION\n" + dhmToString(secondsToDhm(overviewData.sums.total_prioritization_wt))
            }
        ]
        : [
            {
                name: 'Extraneous',
                value: overviewData.avg.avg_extraneous_wt,
                label: "EXTRANEOUS\n" + dhmToString(secondsToDhm(overviewData.avg.avg_extraneous_wt))
            },
            {
                name: 'Batching',
                value: overviewData.avg.avg_batching_wt,
                label: "BATCHING\n" + dhmToString(secondsToDhm(overviewData.avg.avg_batching_wt))
            },
            {
                name: 'Resource Unavailability',
                value: overviewData.avg.avg_unavailability_wt,
                label: "UNAVAILABILITY\n" + dhmToString(secondsToDhm(overviewData.avg.avg_unavailability_wt))
            },
            {
                name: 'Resource Contention',
                value: overviewData.avg.avg_contention_wt,
                label: "CONTENTION\n" + dhmToString(secondsToDhm(overviewData.avg.avg_contention_wt))
            },
            {
                name: 'Prioritization',
                value: overviewData.avg.avg_prioritization_wt,
                label: "PRIORITIZATION\n" + dhmToString(secondsToDhm(overviewData.avg.avg_prioritization_wt))
            }
        ];

    const cycleTimeData = displayMode === "average"
        ? [
            ['Waiting Time', overviewData.waiting_time_avg],
            ['Processing Time', overviewData.processing_time_avg]
        ]
        : [
            ['Waiting Time', overviewData.waiting_time],
            ['Processing Time', overviewData.processing_time]
        ];

    const cycleTimeOptions = {
        title: {
            text: ''
        },
        tooltip: {
            pointFormatter: function (this: any) {
                return `${this.series.name}: <b>${dhmToString(secondsToDhm(this.y))}</b>`;
            }
        },
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
        series: [{
            type: 'pie',
            name: 'Time',
            data: cycleTimeData
        }]
    };

    const totalCycleTime = overviewData.waiting_time + overviewData.processing_time;
    const processingTimePercentage = +parseFloat(((overviewData.processing_time / totalCycleTime) * 100).toFixed(1));
    let avgCycleTime = overviewData.processing_time_avg + overviewData.waiting_time_avg;

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
                <Grid item xs={2}>
                    <Grid container
                          spacing={3}
                          direction="column"
                          justifyContent="flex-start"
                          alignItems="stretch"
                    >
                        <Grid item>
                            <Infobox data={{
                                title: "Cases",
                                value: Intl.NumberFormat('en-US').format(overviewData.num_cases)
                            }}/>
                        </Grid>
                        <Grid item>
                            <Infobox data={{
                                title: "Activities",
                                value: Intl.NumberFormat('en-US').format(overviewData.num_activities)
                            }}/>
                        </Grid>
                        <Grid item>
                            <Infobox data={{
                                title: "Transitions",
                                value: Intl.NumberFormat('en-US').format(overviewData.num_transitions)
                            }}/>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>

                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>

                            <Typography variant="h6" style={{ marginRight: '8px', display: 'inline' }}>
                                Cycle Time
                            </Typography>

                            <div style={{position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)'}}>
                                <FormControl variant="outlined" size="small" style={{marginBottom: '10px'}}>
                                    <InputLabel>Data Mode</InputLabel>
                                    <Select
                                        value={displayMode}
                                        onChange={(event) => setDisplayMode(event.target.value)}
                                        label="Data Mode"
                                    >
                                        <MenuItem value={"total"}>Total</MenuItem>
                                        <MenuItem value={"average"}>Average by case</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        <div style={{fontSize: 'small', marginBottom: '10px'}}>
                            {displayMode === "total"
                                ? `Total Cycle Time: ${dhmToString(secondsToDhm(totalCycleTime))}`
                                : `Average Cycle Time: ${dhmToString(secondsToDhm(avgCycleTime))}`}
                        </div>

                        <HighchartsReact key={displayMode} highcharts={Highcharts} options={cycleTimeOptions}/>
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{fontSize: 'large'}}>
                                <Typography variant="h6" style={{ marginRight: '8px', display: 'inline' }}>
                                    Waiting Times Distribution
                                </Typography>
                                <Tooltip title={
                                    <Typography variant="body2">
                                        Kronos can discover 5 causes of waiting time, specifically due to:
                                        <ol>
                                            <li><strong>Batching</strong> – when an activity instance waits for another activity instance to be enabled in order to be processed together as a batch.</li>
                                            <li><strong>Resource contention</strong> – when an activity instance waits to be processed by an assigned resource that is busy processing other activity instances, following a first-in-first-out (FIFO) order.</li>
                                            <li><strong>Prioritization</strong> – when the assigned resource is busy with an activity instance that was prioritized over the waiting one (not executed in the FIFO order).</li>
                                            <li><strong>Resource unavailability</strong> – when the assigned resource is unavailable (off duty) due to their working schedules.</li>
                                            <li><strong>Extraneous factors</strong> – waiting times caused by external effects that cannot be identified from the event log, e.g., the resource is working on another process, fatigue effects, or context switches.</li>
                                        </ol>
                                    </Typography>
                                }>
                                    <IconButton size="small" style={{ marginLeft: '5px' }}>
                                        <HelpOutlineIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <div style={{position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)'}}>
                                <FormControl variant="outlined" size="small" style={{marginBottom: '10px'}}>
                                    <InputLabel>Data Mode</InputLabel>
                                    <Select
                                        value={pieChartDisplayMode}
                                        onChange={(event) => setPieChartDisplayMode(event.target.value)}
                                        label="Data Mode"
                                    >
                                        <MenuItem value={"total"}>Total</MenuItem>
                                        <MenuItem value={"average"}>Average by case</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <PieChartBox key={pieChartDisplayMode} data={visData}/>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Waiting time causes over the timeframe
                        </Typography>
                    </div>
                    <WaitingTimeframe data={timeframeData}/>
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
                                <MenuItem value={"AverageC"}>Average by case</MenuItem>
                                <MenuItem value={"AverageT"}>Average by transition</MenuItem>
                                <MenuItem value={"Total"}>Total</MenuItem>
                            </Select>
                        </FormControl>

                    </div>

                    <TransitionsBarChart data={transitionsData} />
                </Grid>
                <Grid item xs={12} style={{textAlign: 'center'}}>
                <span onClick={toggleTable}
                      style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'blue'}}>
                    View as a table
                    {showTable ?
                        <ArrowDropUpIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/> :
                        <ArrowDropDownIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/>
                    }
                </span>
                </Grid>
                {showTable && (
                    <Grid item xs={12}>
                        <TransitionsTable data={transitionsData}/>
                    </Grid>
                )}
                <Grid item xs={4}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'center' }}>

                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Cycle Time Efficiency
                        </Typography>

                        <Tooltip
                            title={
                                <span style={{ fontSize: '1rem' }}>
                    Measures the amount of value-added time in a process. Calculated as the ratio of processing time to cycle time. The closer CTE is to 100%, the relatively less waiting time is in the process.
                </span>
                            }
                        >
                            <IconButton size="small" aria-label="info about gauge chart">
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <GaugeChart value={processingTimePercentage} />
                </Grid>
                <Grid item xs={8}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>

                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Potential CTE
                        </Typography>

                        <Tooltip
                            title={
                                <span style={{ fontSize: '1rem' }}>
                    The potential value of CTE if the waiting time due to each cause is eliminated. Helps identify which causes of waiting time to focus on to achieve greater improvements.
                </span>
                            }
                        >
                            <IconButton size="small" aria-label="info about potential CTE chart">
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <PotentialCteChart jsonData={potentialCteData} cte={processingTimePercentage} />
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>

                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Transitions with the highest potential CTE improvement
                        </Typography>

                        <Tooltip
                            title={
                                <span style={{ fontSize: '1rem' }}>
                    Eliminating waiting times in these transitions has the potential to yield the most significant improvement in CTE. Distribution per cause reveals the improvement opportunities in each transition and indicates which opportunities could offer the highest CTE improvement.
                </span>
                            }
                        >
                            <IconButton size="small" aria-label="info about CTE heatmap">
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <CTEHeatmap data={cteTableData} />
                </Grid>
                <Grid item xs={12} style={{textAlign: 'center'}}>
                <span onClick={toggleTable2}
                      style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'blue'}}>
                    View as a table
                    {showTable2 ?
                        <ArrowDropUpIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/> :
                        <ArrowDropDownIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/>
                    }
                </span>
                </Grid>
                {showTable2 && (
                    <Grid item xs={12}>
                        <CTETable data={cteTableData}/>
                    </Grid>
                )}

                {/*<Grid item xs={12}>*/}
                {/*    <Chat jobid={jobId}/>*/}
                {/*</Grid>*/}
            </Grid>
        </Box>
    );
}

export default AllTransitionsLayout;