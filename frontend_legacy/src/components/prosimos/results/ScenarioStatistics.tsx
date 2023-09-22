import { useState, useEffect } from "react";
import { TableContainer, Paper, Toolbar, Typography, Table, TableHead, TableRow, TableBody } from "@mui/material";
import { secondsToNearest } from "../../../helpers/timeConversions";
import { makeStyles } from 'tss-react/mui';
import { TableCellRightBorder, TableCellLeftRightBorder } from "./StyledTableCells";

const useStyles = makeStyles()(() => ({
    borderTop: {
        borderTop: "1px solid rgba(224, 224, 224, 1)"
    }
}));

interface ScenarioStatisticsProps {
    data: any
}

enum COLUMNS_NAME {
    KPI = "KPI",
    Min = "Min",
    Max = "Max",
    Average = "Average",
    TraceOcurrences = "Trace Ocurrences"
}

const removeUnderscores = (str: string) => {
    return str.replace(/_/g, ' ');
}

const makeFirstLetterUppercase = (str: string) => {
    return str[0].toUpperCase() + str.slice(1)
}

const ScenarioStatistics = (props: ScenarioStatisticsProps) => {
    const { data } = props
    const [processedData, setProcessedData] = useState([])
    const { classes } = useStyles()

    useEffect(() => {
        const processed = data.map((item: any) => {
            const upd = Object.entries(item).reduce((acc: {}, [key, value]: any) => {
                if (key === COLUMNS_NAME.KPI) {
                    const displayName = makeFirstLetterUppercase(removeUnderscores(value))

                    return {
                        ...acc,
                        "KPI": value,
                        "KPI_display_name": displayName
                    }
                }

                let formatedValue = value

                if (typeof value == "number" && key !== COLUMNS_NAME.TraceOcurrences) {
                    formatedValue = secondsToNearest(value)
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
                    Scenario Statistics
                </Typography>
            </Toolbar>
            <Table size="small">
                <TableHead>
                    <TableRow className={`${classes.borderTop}`}>
                        <TableCellLeftRightBorder align="center" colSpan={1}>
                            KPI
                        </TableCellLeftRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Min
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Average
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Max
                        </TableCellRightBorder>
                        <TableCellRightBorder align="center" colSpan={1}>
                            Trace Ocurrences
                        </TableCellRightBorder>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {processedData.map((row: any) => (
                        <TableRow key={`${row[COLUMNS_NAME.KPI]}`} hover>
                            <TableCellLeftRightBorder component="th" scope="row">{row["KPI_display_name"]}</TableCellLeftRightBorder>
                            <TableCellRightBorder align="center">{row[COLUMNS_NAME.Min]}</TableCellRightBorder>
                            <TableCellRightBorder align="center">{row[COLUMNS_NAME.Average]}</TableCellRightBorder>
                            <TableCellRightBorder align="center">{row[COLUMNS_NAME.Max]}</TableCellRightBorder>
                            <TableCellRightBorder align="center">{row[COLUMNS_NAME.TraceOcurrences]}</TableCellRightBorder>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer> 
    )
}

export default ScenarioStatistics;
