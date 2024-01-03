import * as React from "react";
import HighchartsReact from "highcharts-react-official";
import * as Highcharts from "highcharts";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import {useFetchData} from '../../../helpers/useFetchData';

require("moment");
HighchartsHeatmap(Highcharts);
require("moment-duration-format");
export default function CTEHeatmap({data}: { data: any }) {
    let report_data = [...data.data]
    let sorted_report = report_data.sort(
        (p1: any, p2: any) => (p1.cte_impact_total < p2.cte_impact_total ? 1 : (p1.cte_impact_total > p2.cte_impact_total) ? -1 : 0)
    )

    let heatmap_data = sorted_report.slice(0, 10)

    let categories = [] as string[]
    // Data format for heatmap = [[x,y, val], [x2,y2, val], ...]
    let key_number_correspondents = {
        batching_impact: 0,
        prioritization_impact: 1,
        contention_impact: 2,
        unavailability_impact: 3,
        extraneous_impact: 4
    }
    let processed_data = []
    for (const dataKey in heatmap_data) {

        categories.push(heatmap_data[dataKey].source_activity + ' - ' + heatmap_data[dataKey].target_activity)
        for (const heatmapDataKey in heatmap_data[dataKey].cte_impact) {

            let out = [
                // @ts-ignore
                key_number_correspondents[heatmapDataKey],
                Number(dataKey),
                heatmap_data[dataKey].cte_impact[heatmapDataKey]
            ]
            processed_data.push(out)
        }
    }

    const options = {
        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            marginRight: 20,
            plotBorderWidth: 1,
            style: {
                fontFamily: 'Roboto',
                fontSize: 18
            }
        },
        title: {
            text: '',
            align: 'left'
        },

        xAxis: {
            categories: ['Batching', 'Prioritization', 'Resource contention', 'Resource unavailability', 'Extraneous'],

        },

        yAxis: {
            categories: categories,
            title: null,
            reversed: true
        },
        colorAxis: {
            min: 0,
            max: 100,
            minColor: '#FFFFFF',
            maxColor: '#008000',
            tickPositioner: function () {
                return [0, 100];
            },
            labels: {
                enabled: true,
                formatter(this: any) {
                    if (this.isFirst && this.pos === 0) {
                        return "No Improvement"
                    }
                    if (this.isLast && this.pos === 1) {
                        return "High Improvement"
                    }
                },
            }
        },
        legend: {
            // enabled: false,
            // align: 'right',
            // layout: 'vertical',
            margin: 0,
            // lineWidth: 0,
            // minorGridLineWidth: 0,
            // minorTickLength: 0,
            //
            // tickLength: 0,
            // verticalAlign: 'top',
            y: 20,
            // symbolHeight: 280
            symbolWidth: 500
        },
        tooltip: {
            enabled: false,
            formatter(this: Highcharts.TooltipFormatterContextObject) {
                // @ts-ignore
                return "CTE after removing: " + (this.point.value).toFixed(2) + "%"
            }
        },

        series: [{
            name: '',
            borderWidth: 1,
            data: processed_data,
            dataLabels: {
                enabled: true,
                color: '#000000',
                formatter(this: any) {

                    // @ts-ignore
                    return (this.point.value).toFixed(2) + "%"
                }
            }
        }],
    }

    return (
        <>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </>
    )
};