import type { useReactTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

export function TanstackSimpleTable({
  table,
  ...rest
}: { table: ReturnType<typeof useReactTable> } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex justify-center w-11/12 overflow-x-auto shadow-md sm:rounded-lg ${
        rest.className ? rest.className : ""
      }`}
    >
      <table className="grow text-sm text-left text-slate-700">
        <thead className="text-sm text-slate-700 uppercase tracking-wide bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-2 py-3 border-r border-slate-200 text-center ${
                    header.colSpan > 1 ? "bg-slate-50 border-b" : ""
                  }`}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
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
  );
}
