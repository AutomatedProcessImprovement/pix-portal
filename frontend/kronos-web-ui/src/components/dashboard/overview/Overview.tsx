// import React, { useState, useEffect } from 'react';
// import { Box, Grid } from '@mui/material';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';
// import Infobox from "../Infobox";
// import PieChartBox from "../PieChartBox";
// import WaitingTimeframe from "./WaitingTimeframe";
// import TransitionsBarChart from "./TransitionsBarChart";
// import TransitionsTable from "./TransitionsTable";
// import { secondsToDhm } from '../../../helpers/SecondsToDhm';
// import { dhmToString } from '../../../helpers/dhmToString';
// require("moment-duration-format");
//
// const useFetchData = (url: string) => {
//     const [data, setData] = useState<any>(null);
//     useEffect(() => {
//         fetch(url)
//             .then(response => response.json())
//             .then(jsonData => setData(jsonData))
//             .catch(error => console.error(`Error fetching data from ${url}: `, error));
//     }, [url]);
//     return data;
// };
//
// function Dashboard({ jobId }: { jobId: string; selectedActivityPair: string; }) {
//     const [showTable, setShowTable] = useState(false);
//     const overviewData = useFetchData(`http://154.56.63.127:5000/overview/${jobId}`);
//     const transitionsData = useFetchData(`http://154.56.63.127:5000/activity_transitions/${jobId}`);
//
//     if (!overviewData || !transitionsData) {
//         return <div>Loading...</div>;
//     }
//
//     const toggleTable = () => setShowTable(!showTable);
//
//     const visData = [
//         {
//             name: 'Extraneous',
//             value: overviewData.sums.total_extraneous_wt,
//             label: "EXTRANEOUS\n" + dhmToString(secondsToDhm(overviewData.sums.total_extraneous_wt))
//         },
//         {
//             name: 'Batching',
//             value: overviewData.sums.total_batching_wt,
//             label: "BATCHING\n" + dhmToString(secondsToDhm(overviewData.sums.total_batching_wt))
//         },
//         {
//             name: 'Resource Unavailability',
//             value: overviewData.sums.total_unavailability_wt,
//             label: "UNAVAILABILITY\n" + dhmToString(secondsToDhm(overviewData.sums.total_unavailability_wt))
//         },
//         {
//             name: 'Resource Contention',
//             value: overviewData.sums.total_contention_wt,
//             label: "CONTENTION\n" + dhmToString(secondsToDhm(overviewData.sums.total_contention_wt))
//         },
//         {
//             name: 'Prioritization',
//             value: overviewData.sums.total_prioritization_wt,
//             label: "PRIORITIZATION\n" + dhmToString(secondsToDhm(overviewData.sums.total_prioritization_wt))
//         }
//     ];
//
//     const cycleTimeOptions = {
//         title: {
//             text: ''
//         },
//         tooltip: {
//             pointFormatter: function(this: any) {
//                 return `${this.series.name}: <b>${dhmToString(secondsToDhm(this.y))}</b>`;
//             }
//         },
//         plotOptions: {
//             pie: {
//                 allowPointSelect: true,
//                 cursor: 'pointer',
//                 dataLabels: {
//                     enabled: true,
//                     format: '<b>{point.name}</b>: {point.percentage:.1f} %'
//                 }
//             }
//         },
//         series: [{
//             type: 'pie',
//             name: 'Time',
//             data: [
//                 ['Waiting Time', overviewData.waiting_time],
//                 ['Processing Time', overviewData.processing_time]
//             ]
//         }]
//     };
//
//     const totalCycleTime = overviewData.waiting_time + overviewData.processing_time;
//
//     return (
//         <Box sx={{
//             display: 'flex',
//             justifyContent: 'center',
//             p: 1,
//             m: 1,
//             bgcolor: 'background.paper',
//             borderRadius: 1,
//             mx: "5rem"
//         }}>
//             <Grid container
//                   spacing={3}
//                   flexGrow={1}
//                   justifyContent="flex-start"
//                   display={"flex"}
//                   flexDirection={"row"}
//                   alignItems={"stretch"}
//             >
//                 <Grid item xs={2}>
//                     <Grid container
//                           spacing={3}
//                           direction="column"
//                           justifyContent="flex-start"
//                           alignItems="stretch"
//                     >
//                         <Grid item>
//                             <Infobox data={{
//                                 title: "Cases",
//                                 subtitle: "Total number of cases with wt",
//                                 value: Intl.NumberFormat('en-US').format(overviewData.num_cases)
//                             }}/>
//                         </Grid>
//                         <Grid item>
//                             <Infobox data={{
//                                 title: "Activities",
//                                 subtitle: "Total number of activities",
//                                 value: Intl.NumberFormat('en-US').format(overviewData.num_activities)
//                             }}/>
//                         </Grid>
//                         <Grid item>
//                             <Infobox data={{
//                                 title: "Transitions",
//                                 value: Intl.NumberFormat('en-US').format(overviewData.num_transitions)
//                             }}/>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//                 <Grid item xs={4}>
//                     <div style={{textAlign: 'center', backgroundColor: '#fff', padding: '10px', borderRadius: '8px'}}>
//                         <div style={{fontSize: 'large', marginBottom: '5px'}}>
//                             Cycle Time
//                         </div>
//                         <div style={{fontSize: 'small', marginBottom: '10px'}}>
//                             Total Cycle Time: {dhmToString(secondsToDhm(totalCycleTime))}
//                         </div>
//                         <HighchartsReact highcharts={Highcharts} options={cycleTimeOptions}/>
//                     </div>
//                 </Grid>
//                 <Grid item xs={6}>
//                     <div style={{textAlign: 'center', backgroundColor: '#fff', padding: '10px', borderRadius: '8px'}}>
//                         <PieChartBox data={visData}/>
//                     </div>
//                 </Grid>
//                 <Grid item xs={12}>
//                     <WaitingTimeframe jobId={jobId}/>
//                 </Grid>
//                 <Grid item xs={12}>
//                     <TransitionsBarChart data={transitionsData}/>
//                 </Grid>
//                 <Grid item xs={12} style={{textAlign: 'center'}}>
//                 <span onClick={toggleTable}
//                       style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'blue'}}>
//                     View as a table
//                     {showTable ?
//                         <ArrowDropUpIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/> :
//                         <ArrowDropDownIcon style={{verticalAlign: 'middle', fontSize: '1.5rem'}}/>
//                     }
//                 </span>
//                 </Grid>
//                 {showTable && (
//                     <Grid item xs={12}>
//                         <TransitionsTable jobId={jobId}/>
//                     </Grid>
//                 )}
//             </Grid>
//         </Box>
//     );
// }
//
//     export default Dashboard;


import React from 'react';
import AllTransitionsLayout from './AllTransitionsLayout';
import SpecificTransitionLayout from './SpecificTransitionLayout';

function Overview({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <AllTransitionsLayout jobId={jobId}/>
            ) : (
                <SpecificTransitionLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
};

export default Overview;

