import React, { FC } from "react";
import * as Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import type { Solution } from "~/shared/optimos_json_type";
import { Grid } from "@mui/material";
import { formatCurrency, formatHours, formatSeconds } from "~/shared/num_helper";

interface SolutionChartProps {
  solutions: Solution[];
  initialSolution?: Solution;
  averageCost: number;
  averageTime: number;
}

export const SolutionChart: FC<SolutionChartProps> = ({ solutions, initialSolution, averageCost, averageTime }) => {
  const options: Highcharts.Options = {
    chart: {
      type: "scatter",
      events: {
        click: function (event) {
          // Handle chart click event here
          console.log("Chart Clicked:", event);
        },
      },
    },
    title: {
      text: "Solutions",
    },
    tooltip: {
      formatter: function () {
        return `Time: ${formatSeconds(this.x as number)}<br>Cost: ${formatCurrency(this.y ?? 0)}`;
      },
    },
    xAxis: {
      title: {
        text: "Time",
      },
      labels: {
        formatter: function () {
          return Math.round(((this.value as number) * 10) / 60) / 10 + "h";
        },
      },
    },
    yAxis: {
      title: {
        text: "Cost",
      },
      labels: {
        formatter: function () {
          return formatCurrency(this.value as number);
        },
      },
    },
    plotOptions: {
      scatter: {
        marker: {
          symbol: "circle",
        },
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              // Handle data point click event here
              console.log("Data Point Clicked:", this.x, this.y);
              // Navigate to specific execution via anchor link
              window.location.href = `#solution_${this.index}`;
            },
          },
        },
      },
    },
    series: [
      {
        name: "Solution",
        data: solutions.map((solution, index) => ({
          x: solution.solution_info.mean_process_cycle_time,
          y: solution.solution_info.total_pool_cost,
          id: `execution_${index}`,
        })),
        type: "scatter",
      },
      {
        name: "Initial Solution",
        data: [
          {
            x: initialSolution?.solution_info.mean_process_cycle_time,
            y: initialSolution?.solution_info.total_pool_cost,
            id: `execution_${0}`,
          },
        ],
        color: "red",
        type: "scatter",
      },
      // {
      //   name: "Average Solution",
      //   data: [
      //     {
      //       x: averageCost,
      //       y: averageTime,
      //     },
      //   ],
      //   type: "scatter",
      // },
    ],
  };

  return (
    <Grid item xs={12}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Grid>
  );
};
