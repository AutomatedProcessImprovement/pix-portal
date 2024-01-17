import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { ScenarioStatisticsItem } from "../prosimosReport";
import { TanstackSimpleTable } from "./TanstackSimpleTable";

const columnHelper = createColumnHelper<ScenarioStatisticsItem>();

const columns = [
  columnHelper.accessor("KPI", {
    cell: (info) => formatKPI(info.renderValue<string>()),
    header: () => <span>KPI</span>,
  }),
  columnHelper.accessor("Min", {
    cell: (info) => `${stringToHours(info.getValue<string>())} hours`,
    header: () => <span>Min</span>,
  }),
  columnHelper.accessor("Max", {
    cell: (info) => `${stringToHours(info.getValue<string>())} hours`,
    header: () => <span>Max</span>,
  }),
  columnHelper.accessor("Average", {
    cell: (info) => `${stringToHours(info.getValue<string>())} hours`,
    header: () => <span>Average</span>,
  }),
  columnHelper.accessor("Trace Ocurrences", {
    cell: (info) => info.getValue(),
    header: () => <span>Trace Occurrences</span>,
  }),
];

function stringToHours(value: string) {
  return (parseFloat(value) / 3600).toFixed(2);
}

function formatKPI(kpi: string) {
  const label = kpi.replace(/_/g, " ");
  return label.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

export function ScenarioStatistics({ data }: { data: ScenarioStatisticsItem[] }) {
  // setting data as state to avoid infinite re-rendering
  const [data_, setData] = useState<ScenarioStatisticsItem[]>([]);
  useEffect(() => {
    setData(data);
  }, [data]);

  const table = useReactTable({
    data: data_,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-bold mb-4">Scenario Statistics</h2>
      <TanstackSimpleTable table={table} />
    </section>
  );
}
