import React from 'react';
import HighchartsReact from "highcharts-react-official";
import * as Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock"
import {secondsToDhm} from "../../../helpers/SecondsToDhm";
import {dhmToString} from "../../../helpers/dhmToString";

require("moment-duration-format");

stockInit(Highcharts)


type DataObject = {
    name: any;
    total_wt: any;
    batching_wt: any;
    prioritization_wt: any;
    contention_wt: any;
    unavailability_wt: any;
    extraneous_wt: any;
    [key: string]: any;
};


const _colorDict = {
    batching: "#6C8EBF",
    prioritization: "#B8544F",
    contention: "#D7B500",
    unavailability: "#63B7B0",
    extraneous: "#B3B3B3",
}
const COLORS = [_colorDict.batching, _colorDict.prioritization, _colorDict.contention, _colorDict.unavailability, _colorDict.extraneous]

type WTType = keyof typeof _colorDict;

interface Props {
    data: any;
    selectedWTType?: WTType;
}

function TransitionsBarChart({data, selectedWTType}: Props) {
    let dataArray = [];

    if (Array.isArray(data.data) && data.data.length > 0) {
        dataArray = data.data;
    } else if (data.data) {
        dataArray = [data.data];
    } else if (data && Array.isArray(data)) {
        dataArray = data;
    } else if (data && !Array.isArray(data)) {
        dataArray = [data];
    } else if (data === []) {
        return <div>No data present</div>;
    } else {
        return <div>No data available</div>;
    }

    const isActivityTransitionType = dataArray.length > 0 && dataArray[0].hasOwnProperty('source_activity');
    const isSingleActivityType = !isActivityTransitionType && dataArray.length > 0 && dataArray[0].hasOwnProperty('activity');

    let processed_data = []
    let pre_categories = []
    let categories = [] as string[]
    if (isActivityTransitionType) {
        for (const dataKey in dataArray) {
            let out = {
                name: dataArray[dataKey].source_activity.trim().charAt(0).toUpperCase() + dataArray[dataKey].source_activity.trim().slice(1).toLowerCase() +
                    ' - ' + dataArray[dataKey].target_activity.trim().charAt(0).toUpperCase() + dataArray[dataKey].target_activity.trim().slice(1).toLowerCase(),
                total_wt: dataArray[dataKey].total_wt,
                batching_wt: dataArray[dataKey].batching_wt,
                prioritization_wt: dataArray[dataKey].prioritization_wt,
                contention_wt: dataArray[dataKey].contention_wt,
                unavailability_wt: dataArray[dataKey].unavailability_wt,
                extraneous_wt: dataArray[dataKey].extraneous_wt,

            }
            pre_categories.push(out)
        }
    } else if (isSingleActivityType) {
        for (const dataKey in dataArray) {
            let out = {
                name: dataArray[dataKey].activity.trim().charAt(0).toUpperCase() + dataArray[dataKey].activity.trim().slice(1).toLowerCase(),
                total_wt: dataArray[dataKey].total_wt,
                batching_wt: dataArray[dataKey].batching_wt,
                prioritization_wt: dataArray[dataKey].prioritization_wt,
                contention_wt: dataArray[dataKey].contention_wt,
                unavailability_wt: dataArray[dataKey].unavailability_wt,
                extraneous_wt: dataArray[dataKey].extraneous_wt,
            };
            pre_categories.push(out);
        }
    } else {
        for (const dataKey in dataArray) {
            let source = dataArray[dataKey].source_resource;
            let target = dataArray[dataKey].target_resource;

            let formattedSource = (typeof source === 'string') ? source.trim().charAt(0).toUpperCase() + source.trim().slice(1).toLowerCase() : "Unknown";
            let formattedTarget = (typeof target === 'string') ? target.trim().charAt(0).toUpperCase() + target.trim().slice(1).toLowerCase() : "Unknown";
            let out = {
                name: formattedSource + ' - ' + formattedTarget,
                total_wt: dataArray[dataKey].total_wt,
                batching_wt: dataArray[dataKey].batching_wt,
                prioritization_wt: dataArray[dataKey].prioritization_wt,
                contention_wt: dataArray[dataKey].contention_wt,
                unavailability_wt: dataArray[dataKey].unavailability_wt,
                extraneous_wt: dataArray[dataKey].extraneous_wt,

            }
            pre_categories.push(out)
        }
    }

    let sorted_categories = pre_categories.sort((p1: DataObject, p2: DataObject) => {
        // If a specific WTType is selected, sort based on that. Otherwise, sort based on total_wt.
        const sortKey = selectedWTType ? `${selectedWTType}_wt` : 'total_wt';

        return (p1[sortKey] < p2[sortKey] ? 1 : (p1[sortKey] > p2[sortKey] ? -1 : 0));
    });

    for (const x in sorted_categories) {

        categories.push(sorted_categories[x].name)
    }

    type CauseData = {
        name: string;
        data: number[];
    };

    type AllData = {
        [cause in WTType]: CauseData;
    }

    let allData: AllData = {
        batching: {
            name: "Batching",
            data: [] as number[]
        },
        prioritization: {
            name: "Prioritization",
            data: [] as number[]
        },
        contention: {
            name: "Resource contention",
            data: [] as number[]
        },
        unavailability: {
            name: "Resource unavailability",
            data: [] as number[]
        },
        extraneous: {
            name: "Extraneous",
            data: [] as number[]
        }
    };

    for (const dataKey in sorted_categories) {
        allData.batching.data.push(Math.round(sorted_categories[dataKey].batching_wt));
        allData.prioritization.data.push(Math.round(sorted_categories[dataKey].prioritization_wt));
        allData.contention.data.push(Math.round(sorted_categories[dataKey].contention_wt));
        allData.unavailability.data.push(Math.round(sorted_categories[dataKey].unavailability_wt));
        allData.extraneous.data.push(Math.round(sorted_categories[dataKey].extraneous_wt));
    }

    if (selectedWTType) {
        let other = {
            name: "Other causes",
            data: [] as number[]
        };
        for (let i = 0; i < sorted_categories.length; i++) {
            other.data.push(0);
            for (const cause in allData) {
                if (cause !== selectedWTType) {
                    other.data[i] += allData[cause as WTType].data[i];
                }
            }
        }
        processed_data.push(allData[selectedWTType], other);
    } else {
        for (const cause in allData) {
            processed_data.push(allData[cause as WTType]);
        }
    }

    const baseHeight = 200;
    const additionalHeightPerCategory = 50;
    const maxHeight = 600;
    const dynamicHeight = Math.min(maxHeight, baseHeight + (categories.length * additionalHeightPerCategory));

    const options = {
        b_totals: [],
        colors: selectedWTType ? [_colorDict[selectedWTType], "lightblue"] : COLORS,
        chart: {
            type: 'bar',
            padding: [0, 0, 0, 0],
            margin: [60, 50, 125, 250],
            height: dynamicHeight,
            style: {
                fontFamily: 'Roboto',
                fontSize: 18
            }
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'category',
            categories: categories,
            min: 0,
            max: categories.length < 9 ? categories.length - 1 : 8,
            scrollbar: {
                enabled: true
            },
            tickLength: 0
        },
        yAxis: {
            reversedStacks: false,
            title: {
                text: 'Time',
                align: 'high'
            },
            labels: {
                align: 'right',
                formatter(this: any) {
                    const [y, mo, d, h, m] = secondsToDhm(this.value);
                    return dhmToString([y, mo, d, h, m]);
                }
            },
            stackLabels: {
                align: 'right',
                x: 20,
                enabled: true,
                formatter: function(this: any) {
                    const [y, mo, d, h, m] = secondsToDhm(this.total);
                    return dhmToString([y, mo, d, h, m]);
                },
                tooltip: {
                    formatter(this: any) {
                        const [y, mo, d, h, m] = secondsToDhm(this.y);
                        return `${this.series.name}: ${dhmToString([y, mo, d, h, m])}`;
                    }
                }
            }
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                pointWidth: 20,
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    formatter(this: any) {
                        if (this.point.stackTotal === 0) return null;
                        const percentage = (this.y / this.point.stackTotal) * 100;
                        return `${Math.round(percentage)}%`;
                    },
                    style: {
                        fontSize: '10px',
                    }
                },
            },
        },
        legend: {
            enabled: true,
            reversed: false
        },
        tooltip: {
            formatter(this: any) {
                const [y, mo, d, h, m] = secondsToDhm(this.y);
                return `${this.series.name}: ${dhmToString([y, mo, d, h, m])}`;
            }
        },
        series: processed_data
    }

    return (
        <>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </>
    )
}

export default TransitionsBarChart
