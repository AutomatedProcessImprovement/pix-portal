import React from 'react';
import {dhmToString} from "../../../helpers/dhmToString";
import {secondsToDhm} from "../../../helpers/SecondsToDhm";
import {useFetchData} from "../../../helpers/useFetchData";
import {Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import WaitingTimeframe from "../overview/WaitingTimeframe";
import ResourcesBarChart from "../ResourcesBarChart";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TransitionsBarChart from "../overview/TransitionsBarChart";

interface ContentionSpecificTransitionsLayoutProps {
    jobId: string;
    selectedActivityPair: any;
}

const ContentionSpecificTransitionsLayout: React.FC<ContentionSpecificTransitionsLayoutProps> = ({
                                                                                                     jobId,
                                                                                                     selectedActivityPair
                                                                                                 }) => {
    const [sourceActivity, destinationActivity] = selectedActivityPair.split(' - ');
    const overviewData = useFetchData(`/wt_overview/${jobId}/contention/${sourceActivity}/${destinationActivity}`);
    const timeFrameData = useFetchData(`/daily_summary/${jobId}/${sourceActivity}/${destinationActivity}`);
    const activityResourceWT = useFetchData(`/activity_resource_wt/${jobId}`);
    const barChartData = useFetchData(`/activity_transitions/${jobId}/${sourceActivity}/${destinationActivity}`);
    const barChartDataByResource = useFetchData(`/activity_transitions_by_resource/${jobId}/${sourceActivity}/${destinationActivity}`);
    const [selectedMode, setSelectedMode] = React.useState('Average');

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSelectedMode(event.target.value);
    };


    if (!overviewData || !timeFrameData || !activityResourceWT ||!activityResourceWT || !barChartDataByResource || !barChartData) {
        return <div>Loading...</div>;
    }

    if (overviewData && overviewData.distinct_cases === 0 && overviewData.wt_sum === 0) {
        return <strong>This transition has no waiting time due to contention</strong>;
    }

    const caseFrequencyOptions = {
        chart: {
            height: 300,
        },
        title: {
            text: null
        },
        colors: ['#D7B500', 'lightblue'],
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
        colors: ['#D7B500', 'lightblue'],
        tooltip: {
            pointFormatter: function (this: any) {
                return `${this.series.name}: <b>${dhmToString(secondsToDhm(this.y))}</b>`;
            }
        },
        series: [{
            type: 'pie',
            data: [
                ['Resourse Contention', wtValue],
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
    const avgBiggestSourceDestPair = `${overviewData.avg_biggest_source_dest_resource_pair[1]} - ${overviewData.avg_biggest_source_dest_resource_pair[0]}`;
    const avgValueText = dhmToString(secondsToDhm(overviewData.avg_biggest_source_dest_resource_pair[2]));
    const avgHighestSourceText = overviewData.avg_biggest_resource[0];
    const avgHighestSourceValue = dhmToString(secondsToDhm(overviewData.avg_biggest_resource[1]));

    // Setting up data for 'In Total'
    const totalBiggestSourceDestPair = `${overviewData.biggest_source_dest_resource_pair[1]} - ${overviewData.biggest_source_dest_resource_pair[0]}`;
    const totalValueText = dhmToString(secondsToDhm(overviewData.biggest_source_dest_resource_pair[2]));
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
                                WT due to Contention
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
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Average</div>
                        <div style={{textAlign: 'left'}}>Handover: {avgBiggestSourceDestPair}</div>
                        <div style={{textAlign: 'left', marginBottom: '10px'}}>{avgValueText}</div>
                        <div style={{textAlign: 'left', whiteSpace: 'pre-line'}}>Resource: {avgHighestSourceText}</div>
                        <div style={{textAlign: 'left', marginBottom: '35px', whiteSpace: 'pre-line'}}>{avgHighestSourceValue}</div>

                        {/* In Total */}
                        <div style={{fontWeight: 'bold', marginBottom: '10px', textAlign: 'left'}}>Total</div>
                        <div style={{textAlign: 'left'}}>Handover: {totalBiggestSourceDestPair}</div>
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
                        sourceActivity={sourceActivity}
                        destinationActivity={destinationActivity}
                        wtType={"contention"}
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

                    <TransitionsBarChart data={barChartData} selectedWTType={'contention'}/>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" style={{ marginRight: '8px' }}>
                            Resources
                        </Typography>
                    </div>
                    <ResourcesBarChart data={activityResourceWT} selectedWt="contention" selectedActivity={destinationActivity} />
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <TransitionsBarChart data={barChartDataByResource} selectedWTType={'contention'}/>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ContentionSpecificTransitionsLayout;