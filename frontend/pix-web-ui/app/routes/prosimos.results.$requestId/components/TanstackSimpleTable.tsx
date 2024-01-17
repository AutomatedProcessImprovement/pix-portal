import type { useReactTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

export function TanstackSimpleTable({
  table,
  ...rest
}: { table: ReturnType<typeof useReactTable> } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative overflow-x-auto shadow-md sm:rounded-lg ${rest.className}`}>
      <table className="w-full text-sm text-left rtl:text-right text-slate-700">
        <thead className="text-sm text-slate-700 uppercase tracking-wide bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="bg-white border-b hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
