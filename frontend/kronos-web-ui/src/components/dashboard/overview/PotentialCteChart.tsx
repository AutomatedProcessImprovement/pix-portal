import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {Card} from '@mui/material';

interface BarChartBoxProps {
    jsonData: {
        [key: string]: number;
    };
    cte: number;
}

interface DataLabelContext {
    y: number;
}

const colorDict: { [key: string]: string } = {
    Batching: "#6C8EBF",
    Prioritization: "#B8544F",
    Contention: "#D7B500",
    Unavailability: "#63B7B0",
    Extraneous: "#B3B3B3",
};

const legendNameMap: { [key: string]: string } = {
    Batching: "Batching",
    Prioritization: "Prioritization",
    Contention: "Resource Contention",
    Unavailability: "Resource Unavailability",
    Extraneous: "Extraneous",
};

export default function PotentialCteChart({jsonData, cte}: BarChartBoxProps) {
    const orderedKeys = Object.keys(colorDict);
    const series = orderedKeys.map(key => {
        console.log(key, jsonData[key]);
        return {
            name: legendNameMap[key] || key,
            data: [jsonData[key] || 0],
            color: colorDict[key],
        };
    });

    const options = {
        chart: {
            type: 'column',
            marginLeft: 200,
            style: {
                fontFamily: 'Roboto',
                fontSize: 18,
            },
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '15px'
                    },
                    formatter(this: DataLabelContext): string {
                        return `${this.y.toFixed(2)}%`;
                    }
                }
            }
        },
        title: {
            text: '',
            align: 'left',
            style: {
                fontFamily: 'Roboto',
            },
        },
        xAxis: {
            categories: ['Reasons'],
        },
        yAxis: {
            title: {
                text: '',
            },
            plotLines: [{
                color: 'red',
                width: 2,
                value: cte,
                label: {
                    text: `CTE Value: ${cte}%`,
                    align: 'left',
                    x: -175
                },
            }],
        },
        series,
    };

    return (
        <Card sx={{minWidth: 500, minHeight: 450, zIndex: 100}}>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </Card>
    );
}
