import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import moment from 'moment';
import {secondsToDhm} from '../../../helpers/SecondsToDhm';
import {dhmToString} from '../../../helpers/dhmToString';

const _colorDict = {
    batching: "#6C8EBF",
    prioritization: "#B8544F",
    contention: "#D7B500",
    unavailability: "#63B7B0",
    extraneous: "#B3B3B3",
};

const legendNameMap: {[key in WTType]?: string} = {
    batching: "Batching",
    prioritization: "Prioritization",
    contention: "Resource Contention",
    unavailability: "Resource Unavailability",
    extraneous: "Extraneous",
};

type WTType = keyof typeof _colorDict;

const WaitingTimeframe = ({data, sourceActivity, destinationActivity, wtType}: {
    data: any;
    sourceActivity?: string;
    destinationActivity?: string;
    wtType?: WTType
}) => {
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [timeUnit, setTimeUnit] = React.useState<moment.unitOfTime.StartOf>('day');

    const aggregateData = (data: any[], timeUnit: moment.unitOfTime.StartOf) => {
        const aggregatedData: any = {};
        data.forEach((dayData: any) => {
            const key = moment(dayData.day).startOf(timeUnit).format('YYYY-MM-DD');
            if (!aggregatedData[key]) {
                aggregatedData[key] = {...dayData};
            } else {
                Object.keys(dayData).forEach((field) => {
                    if (field !== 'day') {
                        aggregatedData[key][field] += dayData[field];
                    }
                });
            }
        });
        return Object.values(aggregatedData);
    };

    const generateSeries = (data: any[]) => {
        if (wtType && _colorDict[wtType]) {
            const otherTypes = Object.keys(_colorDict).filter(key => key !== wtType);
            return [
                {
                    name: 'Other Causes',
                    data: data.map(d => otherTypes.reduce((acc, type) => acc + d[`total_${type}_wt`], 0)),
                    color: 'lightblue',
                    tooltip: {
                        pointFormatter: function (this: Highcharts.Point): string {
                            const formattedValue = dhmToString(secondsToDhm(this.y as any));
                            return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${formattedValue}</b><br/>`;
                        },
                    },
                },
                {
                    name: legendNameMap[wtType] || wtType,
                    data: data.map(d => d[`total_${wtType}_wt`]),
                    color: _colorDict[wtType],
                    tooltip: {pointFormatter: generateTooltipFormatter(wtType)}
                },
            ];
        } else {
            return Object.keys(_colorDict).map((type) => {
                const key = type as WTType;
                return {
                    name: legendNameMap[key] || key,
                    data: data.map(d => d[`total_${key}_wt`]),
                    color: _colorDict[key],
                    tooltip: {pointFormatter: generateTooltipFormatter(key)}
                };
            }).reverse();
        }
    };

    const generateTooltipFormatter = (type: string) => {
        return function (this: Highcharts.Point): string {
            const formattedValue = dhmToString(secondsToDhm(this.y as any));
            return `<span style="color:${this.color}">\u25CF</span> ${type}: <b>${formattedValue}</b><br/>`;
        };
    };

    const handleTimeUnitChange = (e: SelectChangeEvent<string>) => {
        const newTimeUnit = e.target.value as moment.unitOfTime.StartOf;
        setTimeUnit(newTimeUnit);
        const aggregatedData = aggregateData(chartData, newTimeUnit);
        setChartData(aggregatedData);
    };

    // const endpoint = sourceActivity && destinationActivity
    //     ? `/daily_summary/${jobId}/${sourceActivity}/${destinationActivity}`
    //     : `/daily_summary/${jobId}`;
    // const data = useFetchData(endpoint);

    React.useEffect(() => {
        if (data) {
            const aggregatedData = aggregateData(data, timeUnit);
            setChartData(aggregatedData);
        }
    }, [data, timeUnit]);

    const options = {
        chart: {
            type: 'area',
            zoomType: 'x',
        },
        title: {
            text: '',
            align: 'center',
            style: {
                fontFamily: 'Roboto'
            }
        },
        xAxis: {
            categories: chartData.map((data) => data.day),
            title: {
                text: 'Time Unit',
                align: 'middle',
            },
        },
        yAxis: {
            title: {
                text: 'Waiting Time',
            },
            labels: {
                formatter: function (this: any): string {
                    return dhmToString(secondsToDhm(this.value));
                },
            },
        },
        tooltip: {
            split: true,
        },
        plotOptions: {
            area: {
                stacking: 'normal',
            },
        },
        series: generateSeries(chartData),
        legend: {
            reversed: true
        }
    };

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <FormControl variant="outlined" style={{ minWidth: 150, marginBottom: '20px', marginTop: '20px' }}>
                    <InputLabel htmlFor="timeUnit">Time Unit</InputLabel>
                    <Select
                        label="Time Unit"
                        id="timeUnit"
                        value={timeUnit as string}
                        onChange={handleTimeUnitChange}
                    >
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="week">Week</MenuItem>
                        <MenuItem value="month">Month</MenuItem>
                        <MenuItem value="year">Year</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <HighchartsReact highcharts={Highcharts} options={options}/>
        </Card>
    );
};

export default WaitingTimeframe;
