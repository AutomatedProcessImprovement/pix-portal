import { TableCell, Typography } from "@mui/material";
import { COLUMN_DEFINITIONS } from "./ResourcesTableColumnDefinitions";
import { EnhancedResource } from "~/shared/optimos_json_type";
import { FC } from "react";

type ResourcesTableCellProps = {
  column: (typeof COLUMN_DEFINITIONS)[number];
  resource: EnhancedResource;
};

// Did the value change more than 5%?
const changeIsSignificant = (a: any, b: any, margin = 0.05) => {
  if (typeof a !== "number" || typeof b !== "number") return false;
  if (a === b) return false;
  const change = Math.abs(a - b);
  return change / Math.max(a, b) > margin;
};

export const ResourcesTableCell: FC<ResourcesTableCellProps> = ({
  column: { id, formatFn, lowerIsBetter },
  resource,
}) => {
  const initial_resource = resource.initial_resource;
  return (
    <TableCell key={id} align="left">
      {formatFn(resource[id])}
      <br />
      {lowerIsBetter !== undefined && !resource.is_deleted && !resource.is_duplicate && !!initial_resource?.[id] && (
        <DiffInfo a={initial_resource[id]} b={resource[id]} formatFn={formatFn} lowerIsBetter={lowerIsBetter} />
      )}
    </TableCell>
  );
};

export const DiffInfo: FC<{
  a: any;
  b: any;
  formatFn: (typeof COLUMN_DEFINITIONS)[number]["formatFn"];
  lowerIsBetter: boolean;
  suffix?: string;
  margin?: number;
  onlyShowDiff?: boolean;
}> = ({ a, b, formatFn, lowerIsBetter, suffix, margin, onlyShowDiff = false }) =>
  !changeIsSignificant(a, b, margin) ? null : a < b ? (
    <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "red" : "green"}>
      (↑) {formatFn(onlyShowDiff ? b - a : a)} {onlyShowDiff ? `more than ${suffix}` : suffix}
    </Typography>
  ) : (
    <Typography variant="caption" fontSize={10} color={lowerIsBetter ? "green" : "red"}>
      (↓) {formatFn(onlyShowDiff ? a - b : a)} {onlyShowDiff ? `less than ${suffix}` : suffix}
    </Typography>
  );
