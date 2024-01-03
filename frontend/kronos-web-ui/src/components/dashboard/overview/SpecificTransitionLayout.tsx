import React from 'react';
import {Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Typography} from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {secondsToDhm} from '../../../helpers/SecondsToDhm';
import {dhmToString} from '../../../helpers/dhmToString';
import {useFetchData} from '../../../helpers/useFetchData';
import TransitionsBarChart from './TransitionsBarChart';
import WaitingTimeframe from "./WaitingTimeframe";
import GaugeChart from "./GaugeChart";
import PotentialCteChart from "./PotentialCteChart";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface SpecificTransitionLayoutProps {
    jobId: string;
    selectedActivityPair: string;
}

const SpecificTransitionLayout: React.FC<SpecificTransitionLayoutProps> = ({jobId, selectedActivityPair}) => {
    const [sourceActivity, destinationActivity] = selectedActivityPair.split(' - ');

    const generalOverviewData = useFetchData(`/overview/${jobId}`);
    const overviewData = useFetchData(`/case_overview/${jobId}/${sourceActivity}/${destinationActivity}`);
    const barChartData = useFetchData(`/activity_transitions/${jobId}/${sourceActivity}/${destinationActivity}`);
    const barChartAvgDataByResource = useFetchData(`/activity_transitions_avg_by_resource/${jobId}/${sourceActivity}/${destinationActivity}`);
    const barChartTotalDataByResource = useFetchData(`/activity_transitions_by_resource/${jobId}/${sourceActivity}/${destinationActivity}`);
    // const potentialCteData = useFetchData(`/potential_cte_filtered/${jobId}/${sourceActivity}/${destinationActivity}`);
    const cteTableData = useFetchData(`/cte_improvement/${jobId}`);
    const timeFrameData = useFetchData(`/daily_summary/${jobId}/${sourceActivity}/${destinationActivity}`);
    const [selectedMode, setSelectedMode] = React.useState('Average');
    const [selectedMode2, setSelectedMode2] = React.useState('Average');
    const barChartDataByResource = selectedMode2 === "Average" ? barChartAvgDataByResource : barChartTotalDataByResource;

    if (!overviewData || !barChartData || !barChartDataByResource || !timeFrameData || !generalOverviewData || !cteTableData) {
        return <div>Loading...</div>;
    }

    if (overviewData && overviewData.specific_case_count === 0 && overviewData.specific_wttotal_sum == null) {
        return <strong>This transition has no waiting time</strong>;
    }

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSelectedMode(event.target.value);
    };

    // const specificCte = +parseFloat(((overviewData.processing_time / (overviewData.specific_wttotal_sum + overviewData.processing_time)) * 100).toFixed(1));
    const totalCycleTime = generalOverviewData.waiting_time + generalOverviewData.processing_time;
    const processingTimePercentage = +parseFloat(((generalOverviewData.processing_time / totalCycleTime) * 100).toFixed(1));
    const isMaxPairDefined = overviewData.max_wttotal_pair && overviewData.max_wttotal_pair[2] !== 0;
    const highestSourceText = isMaxPairDefined
        ? `Handover: ${overviewData.max_wttotal_pair[0]} - ${overviewData.max_wttotal_pair[1]}\n${dhmToString(secondsToDhm(overviewData.max_wttotal_pair[2]))}`
        : 'No highest handover';
    const highestAvgSourceText = isMaxPairDefined
        ? `Handover: ${overviewData.max_wttotal_avg_pair[0]} - ${overviewData.max_wttotal_avg_pair[1]}\n${dhmToString(secondsToDhm(overviewData.max_wttotal_avg_pair[2]))}`
        : 'No highest average handover';

    const filteredData = cteTableData.data.filter((item: { source_activity: string; target_activity: string; }) =>
        item.source_activity === sourceActivity && item.target_activity === destinationActivity
    );

    const transformedCteImpact = filteredData.map((item: { cte_impact: { batching_impact: any; contention_impact: any; extraneous_impact: any; prioritization_impact: any; unavailability_impact: any; }; }) => ({
        "Batching": item.cte_impact.batching_impact,
        "Contention": item.cte_impact.contention_impact,
        "Extraneous": item.cte_impact.extraneous_impact,
        "Prioritization": item.cte_impact.prioritization_impact,
        "Unavailability": item.cte_impact.unavailability_impact
    }));

    console.log("CTE impact transformed: ", transformedCteImpact);

    const caseFrequencyOptions = {
        chart: {
            height: 300,
        },
        title: {
            text: null
        },
        series: [{
            type: 'pie',
            data: [
                ['Executed', overviewData.specific_case_count],
                ['Not Executed', overviewData.total_case_count - overviewData.specific_case_count]
            ]
        }]
    };

    let wtValue: number;
    let otherCausesValue: number;
    console.log("OVERVIEW, ", overviewData);
    if (selectedMode === 'Average') {
        wtValue = overviewData.avg_specific_wttotal;
        otherCausesValue = overviewData.avg_total_wttotal;
    } else {
        wtValue = overviewData.specific_wttotal_sum;
        otherCausesValue = overviewData.total_wttotal_sum;
    }

    console.log('WT value and Other causes', wtValue);

    const waitingTimeOptions = {
        chart: {
            height: 300,
        },
        title: {
            text: null
        },
        tooltip: {
            pointFormatter: function (this: any) {
                return `${this.series.name}: <b>${dhmToString(secondsToDhm(this.y))}</b>`;
            }
        },
        series: [{
            type: 'pie',
            data: [
                ['Selected Transition', wtValue],
                ['Other transitions', otherCausesValue]
            ]
        }]
    };

    const highestSource = Object.entries(overviewData.specific_sums).reduce<{
        key: string,
        value: number
    }>((acc, [key, value]) => {
        return (value as number) > acc.value ? {key, value: value as number} : acc;
    }, {key: '', value: 0});

    const highestAvgSource = Object.entries(overviewData.specific_avg).reduce<{
        key: string,
        value: number
    }>((acc, [key, value]) => {
        return (value as number) > acc.value ? {key, value: value as number} : acc;
    }, {key: '', value: 0});

    let causeText = "No highest cause";
    let valueText = "0";

    let avgCauseText = "No highest average cause";
    let avgValueText = "0";

    if (highestSource.key) {
        valueText = dhmToString(secondsToDhm(highestSource.value));
        switch (highestSource.key) {
            case "contention_wt":
                causeText = "Resource Contention";
                break;
            case "batching_wt":
                causeText = "Batching";
                break;
            case "prioritization_wt":
                causeText = "Prioritization";
                break;
            case "unavailability_wt":
                causeText = "Resource Unavailability";
                break;
            case "extraneous_wt":
                causeText = "Extraneous Factors";
                break;
            default:
                causeText = highestSource.key;
                break;
        }
    }

    if (highestAvgSource.key) {
        avgValueText = dhmToString(secondsToDhm(highestAvgSource.value));
        switch (highestAvgSource.key) {
            case "contention_wt":
                avgCauseText = "Resource Contention";
                break;
            case "batching_wt":
                avgCauseText = "Batching";
                break;
            case "prioritization_wt":
                avgCauseText = "Prioritization";
                break;
            case "unavailability_wt":
                avgCauseText = "Resource Unavailability";
                break;
            case "extraneous_wt":
                avgCauseText = "Extraneous Factors";
                break;
            default:
                avgCauseText = highestAvgSource.key;
                break;
        }
    }

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
                        <div style={{fontWeight: 'bold', fontSize: '1.2em'}}>Case Frequency</div>
                        <div>{overviewData.specific_case_count} / {overviewData.total_case_count}</div>
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
                                WT in Transition
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
                        {/*<div style={{fontWeight: 'bold', fontSize: '1.2em', marginBottom: '20px'}}>Highest Source</div>*/}
                        {/*<div style={{textAlign: 'left'}}>Cause: {causeText}</div>*/}
                        {/*<div style={{textAlign: 'left'}}>{valueText}</div>*/}
                        {/*<div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{highestSourceText}</div>*/}

                        <div style={{fontWeight: 'bold', fontSize: '1.2em', marginBottom: '35px'}}>Highest Source</div>

                        {/* On Average */}
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Average</div>
                        <div style={{textAlign: 'left'}}>Cause: {avgCauseText}</div>
                        <div style={{textAlign: 'left', marginBottom: '10px'}}>{avgValueText}</div>
                        <div style={{textAlign: 'left', marginBottom: '35px', whiteSpace: 'pre-line'}}>{highestAvgSourceText}</div>

                        {/* In Total */}
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Total</div>
                        <div style={{textAlign: 'left'}}>Cause: {causeText}</div>
                        <div style={{textAlign: 'left', marginBottom: '10px'}}>{valueText}</div>
                        <div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{highestSourceText}</div>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Waiting time causes over the timeframe
                        </Typography>
                    </div>
                    <WaitingTimeframe
                        data={timeFrameData}
                        sourceActivity={sourceActivity}
                        destinationActivity={destinationActivity}
                    />
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Waiting time causes in transition
                        </Typography>

                        <Tooltip
                            title={
                                <span style={{ fontSize: '1rem' }}>
                            Waiting time of transition by the causes of waiting.
                        </span>
                            }
                        >
                            <IconButton size="small" aria-label="info about waiting time causes">
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <TransitionsBarChart data={barChartData}/>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

                            <Typography variant="h6" style={{ marginRight: '8px' }}>
                                Waiting time in handovers
                            </Typography>

                            <Tooltip
                                title={
                                    <span style={{ fontSize: '1rem' }}>
                            Waiting time between a pair of resources executing activities of the selected transition, categorized by the causes of waiting.
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
                                value={selectedMode2}
                                onChange={(e) => setSelectedMode2(e.target.value)}
                                label="Data Mode"
                            >
                                <MenuItem value={"Average"}>Average</MenuItem>
                                <MenuItem value={"Total"}>Total</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <TransitionsBarChart data={barChartDataByResource}/>
                </Grid>
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
                    <GaugeChart value={processingTimePercentage}/>
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
                    <PotentialCteChart jsonData={transformedCteImpact[0]} cte={processingTimePercentage}/>
                </Grid>
            </Grid>
        </Box>
    );

};

export default SpecificTransitionLayout;
