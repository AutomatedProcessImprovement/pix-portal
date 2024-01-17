import { getFileContent } from "~/services/files.server";
import type { ReportPart } from "./prosimosReport";

export async function parseCsvFile(fileId: string, token: string) {
  const blob = await getFileContent(fileId, token);
  const text = blob as string;
  // Prosimos report consists of several parts separated by a line with two quotes ("")
  const parts = text.split('""');
  // Also, we can ignore the first part
  parts.shift();
  const report = parts.map(parseCsvPart);
  return report;
}

function parseCsvPart(part: string): ReportPart {
  const lines = part.match(/[^\r\n]+/g) ?? [];
  // The first line of each part is a title of the table
  const title = lines.shift();
  // The second line of each part is a list of columns
  const columns = lines.shift()?.split(",") ?? [];
  if (!title || !columns) throw new Error("Invalid CSV file");
  if (columns.length === 0) throw new Error("No columns in CSV file");
  const data = lines.map((line) => {
    const values = line.split(",");
    return columns.reduce((acc, column, index) => {
      acc[column as keyof typeof acc] = values[index];
      return acc;
    }, {} as Record<string, string>);
  });
  return { title, data };
}
