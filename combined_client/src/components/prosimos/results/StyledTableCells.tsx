import { TableCell, TableCellProps } from "@mui/material";
import { styled } from "@mui/material/styles";

export const TableCellRightBorder = styled(TableCell)<TableCellProps>(({theme}) => ({
    borderRight: "1px solid rgba(224, 224, 224, 1)"
}));


export const TableCellLeftRightBorder = styled(TableCell)<TableCellProps>(({theme}) => ({
    borderRight: "1px solid rgba(224, 224, 224, 1)",
    borderLeft: "1px solid rgba(224, 224, 224, 1)"
}));
