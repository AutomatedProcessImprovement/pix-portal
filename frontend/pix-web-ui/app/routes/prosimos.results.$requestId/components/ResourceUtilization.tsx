import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { ResourceUtilizationItem } from "../prosimosReport";
import { TanstackSimpleTable } from "./TanstackSimpleTable";

const columnHelper = createColumnHelper<ResourceUtilizationItem>();

const columns = [
  columnHelper.accessor("Resource ID", {
    cell: (info) => info.renderValue(),
    header: () => <span>Resource ID</span>,
  }),
  columnHelper.accessor("Resource name", {
    cell: (info) => info.getValue(),
    header: () => <span>Resource Name</span>,
  }),
  columnHelper.accessor("Utilization Ratio", {
    cell: (info) => parseFloat(info.getValue<string>()).toFixed(2),
    header: () => <span>Utilization Ratio</span>,
  }),
  columnHelper.accessor("Tasks Allocated", {
    cell: (info) => info.getValue(),
    header: () => <span>Allocated Tasks</span>,
  }),
  columnHelper.accessor("Worked Time (seconds)", {
    cell: (info) => parseFloat(info.getValue<string>()).toFixed(0),
    header: () => <span>Time Worked (s)</span>,
  }),
  columnHelper.accessor("Available Time (seconds)", {
    cell: (info) => parseFloat(info.getValue<string>()).toFixed(0),
    header: () => <span>Time Available (s)</span>,
  }),
  columnHelper.accessor("Pool ID", {
    cell: (info) => info.getValue(),
    header: () => <span>Pool ID</span>,
  }),
  columnHelper.accessor("Pool name", {
    cell: (info) => info.getValue(),
    header: () => <span>Pool Name</span>,
  }),
];

export function ResourceUtilization({ data }: { data: ResourceUtilizationItem[] }) {
  // setting data as state to avoid infinite re-rendering
  const [data_, setData] = useState<ResourceUtilizationItem[]>([]);
  useEffect(() => {
    setData(data);
  }, [data]);

  const table = useReactTable({
    data: data_,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="flex flex-col items-center mt-8 w-full">
      <h2 className="text-xl font-bold mb-4">Resource Utilization</h2>
      <TanstackSimpleTable table={table} />
    </section>
  );
}
