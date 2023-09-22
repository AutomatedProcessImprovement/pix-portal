import { useEffect, useState } from "react";
import { TableContainer, Paper, Toolbar, Typography, Table, TableHead, TableRow, TableBody } from "@mui/material";
import { secondsToNearest } from "../../../helpers/timeConversions";
import { makeStyles } from 'tss-react/mui';
import { TableCellRightBorder, TableCellLeftRightBorder } from "./StyledTableCells";

const useStyles = makeStyles()(() => ({
    borderTop: {
        borderTop: "1px solid rgba(224, 224, 224, 1)"
    }
}));

interface ResourceUtilizationProps {
    data: any
}

enum COLUMNS_NAME {
    PoolName = "Pool name",
    ResourceName = "Resource name",
    UtilizationRatio = "Utilization Ratio",
    TasksAllocated = "Tasks Allocated",
    WorkedTime = "Worked Time (seconds)",
    AvailableTime = "Available Time (seconds)"
}

const ResourceUtilization = (props: ResourceUtilizationProps) => {
    const { data } = props
    const [processedData, setProcessedData] = useState(data)
    const { classes } = useStyles()

    useEffect(() => {
        const processed = data.map((item: any) => {
            const upd = Object.entries(item).reduce((acc: {}, [key, value]: any) => {
                let formatedValue = value

                if (typeof value == "number" && (key === COLUMNS_NAME.WorkedTime || key === COLUMNS_NAME.AvailableTime)) {
                    formatedValue = secondsToNearest(value)
                } else if (key === COLUMNS_NAME.UtilizationRatio) {
                    formatedValue = value.toFixed(3)
                }
                
                return {
                    ...acc,
                    [key]: formatedValue
                }
            }, {})

            return upd
        })

        setProcessedData(processed)
    }, [data])

    return (
        <TableContainer component={Paper}>
            <Toolbar >
                <Typography
                    variant="h6"
                >
                    Resource Utilization
                </Typography>
            </Toolbar>
            <Table size="small">
                <TableHead>
                    <TableRow className={classes.borderTop}>
                        <TableCellLeftRightBorder align="center" colSpan={1}>
                            Resource Pool
                        </TableCellLeftRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Resource Profile
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Utilization Ratio
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Tasks Allocated
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Worked Time
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Available Time
                        </TableCellRightBorder>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {processedData.map((row: any) => (
                        <TableRow key={`${row["Resource ID"]}`} hover>
                            <TableCellLeftRightBorder component="th" scope="row" >{row[COLUMNS_NAME.PoolName]}</TableCellLeftRightBorder>
                            <TableCellRightBorder >{row[COLUMNS_NAME.ResourceName]}</TableCellRightBorder>
                            <TableCellRightBorder align="center" >{row[COLUMNS_NAME.UtilizationRatio]}</TableCellRightBorder>
                            <TableCellRightBorder align="center" >{row[COLUMNS_NAME.TasksAllocated]}</TableCellRightBorder>
                            <TableCellRightBorder align="center" >{row[COLUMNS_NAME.WorkedTime]}</TableCellRightBorder>
                            <TableCellRightBorder align="center" >{row[COLUMNS_NAME.AvailableTime]}</TableCellRightBorder>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ResourceUtilization;
