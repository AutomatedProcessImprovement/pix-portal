import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { IndividualTaskStatisticsItem } from "../prosimosReport";

const columnHelper = createColumnHelper<IndividualTaskStatisticsItem>();

const columns = [
  columnHelper.accessor("Name", {
    cell: (info) => info.renderValue(),
    header: () => "Name",
  }),

  columnHelper.accessor("Count", {
    cell: (info) => info.getValue(),
    header: () => "Count",
  }),

  columnHelper.group({
    id: "waiting_time",
    header: () => "Waiting Time",
    columns: [
      {
        accessorKey: "Min Waiting Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Min",
      },
      {
        accessorKey: "Max Waiting Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Max",
      },
      {
        accessorKey: "Avg Waiting Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Avg",
      },
    ],
  }),

  columnHelper.group({
    id: "processing_time",
    header: () => "Processing Time",
    columns: [
      {
        accessorKey: "Min Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Min",
      },
      {
        accessorKey: "Max Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Max",
      },
      {
        accessorKey: "Avg Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Avg",
      },
    ],
  }),

  columnHelper.group({
    id: "idle_processing_time",
    header: () => "Idle Processing Time",
    columns: [
      {
        accessorKey: "Min Idle Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Min",
      },
      {
        accessorKey: "Max Idle Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Max",
      },
      {
        accessorKey: "Avg Idle Processing Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Avg",
      },
    ],
  }),

  columnHelper.group({
    id: "cycle_time",
    header: () => "Cycle Time",
    columns: [
      {
        accessorKey: "Min Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Min",
      },
      {
        accessorKey: "Max Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Max",
      },
      {
        accessorKey: "Avg Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Avg",
      },
    ],
  }),

  columnHelper.group({
    id: "idle_cycle_time",
    header: () => "Idle Cycle Time",
    columns: [
      {
        accessorKey: "Min Idle Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Min",
      },
      {
        accessorKey: "Max Idle Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Max",
      },
      {
        accessorKey: "Avg Idle Cycle Time",
        cell: (info) => formatSeconds(info.getValue()),
        header: () => "Avg",
      },
    ],
  }),
];

function stringToHours(value: string) {
  return (parseFloat(value) / 3600).toFixed(2);
}

function formatSeconds(value: string) {
  return parseFloat(value) > 0 ? stringToHours(value) + " hours" : "0";
}

export function IndividualTaskStatistics({
  data,
  ...rest
}: { data: IndividualTaskStatisticsItem[] } & React.HTMLAttributes<HTMLDivElement>) {
  // setting data as state to avoid infinite re-rendering
  const [data_, setData] = useState<IndividualTaskStatisticsItem[]>([]);
  useEffect(() => {
    setData(data);
  }, [data]);

  const table = useReactTable({
    data: data_,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: data_.length > 0 ? getGroupedRowModel() : undefined, // fixes https://github.com/TanStack/table/issues/5026
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <section className="flex flex-col items-center mt-8 w-full">
      <h2 className="text-xl font-bold mb-4">Individual Task Statistics</h2>
      <div
        className={`flex justify-center w-11/12 overflow-x-auto shadow-md sm:rounded-lg ${
          rest.className ? rest.className : ""
        }`}
      >
        <table className="grow text-sm text-left text-slate-700">
          <thead className="text-sm text-slate-700 uppercase tracking-wide bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200">
                {headerGroup.headers.map((header) => {
                  const columnRelativeDepth = header.depth - header.column.depth;

                  if (!header.isPlaceholder && columnRelativeDepth > 1 && header.id === header.column.id) {
                    return null;
                  }

                  let rowSpan = 1;
                  if (header.isPlaceholder) {
                    const leafs = header.getLeafHeaders();
                    rowSpan = leafs[leafs.length - 1].depth - header.depth;
                  }

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={rowSpan}
                      className={`px-2 py-3 border-r border-slate-200 text-center ${
                        header.colSpan > 1 ? "bg-slate-50 border-b" : ""
                      }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b last:border-none hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2 border-r first:text-left text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
