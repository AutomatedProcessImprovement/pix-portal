import React from 'react';
import Highcharts from "highcharts/highcharts.js";
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";
import HighchartsReact from "highcharts-react-official";

highchartsMore(Highcharts);
solidGauge(Highcharts);

interface GaugeChartProps {
    value: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({value}) => {
    const options: Highcharts.Options = {
        chart: {
            type: 'solidgauge',
        },
        title: {
            text: '',
        },
        pane: {
            startAngle: -90,
            endAngle: 90,
            background: [{
                backgroundColor: '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc',
            }],
        },
        yAxis: {
            min: 0,
            max: 100,
            tickPositions: [],
            labels: {
                enabled: false,
            },
            title: {
                text: '',
            },
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false,
                    format: '<div style="text-align:center; background: none;"><span style="font-size:16px; font-weight:normal">{y:.2f}</span><span style="font-size:16px;opacity:0.4">%</span></div>',
                },
            },
        },
        tooltip: {
            pointFormat: '',
        },
        series: [
            {
                type: 'solidgauge',
                data: [value],
                dataLabels: {
                    enabled: true,
                },
            },
        ],
    };

    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </div>
    );
};

export default GaugeChart;
