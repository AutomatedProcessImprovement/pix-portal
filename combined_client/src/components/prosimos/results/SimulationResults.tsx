import { Button, ButtonGroup, Grid } from "@mui/material";
import ResourceUtilization from "./ResourceUtilization";
import ScenarioStatistics from "./ScenarioStatistics";
import TaskStatistics from "./TaskStatistics";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useEffect, useState } from "react";
import axios from './../../../prosimos_axios';
import CustomizedSnackbar from "./CustomizedSnackbar";
import { makeStyles } from 'tss-react/mui';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const useStyles = makeStyles()({
    resultsGrid: {
        marginTop: "2vh!important"
    }
});

export interface SimulationResult {
    "ResourceUtilization": any,
    "IndividualTaskStatistics": any,
    "OverallScenarioStatistics": any,
    "LogsFilename": string
    "StatsFilename": string
}

interface SimulationResultsProps {
    readonly output: SimulationResult
    //@ts-ignore
    onSaveToProject: (file: File, tag:string) => void
}

const SimulationResults = (props: SimulationResultsProps) => {
    const { classes } = useStyles();
    const { output: outputFromPrevPage, onSaveToProject } = props
    const [currOutput, setCurrOutput] = useState<SimulationResult | null>()
    const [logsFilename, setLogsFilename] = useState("")
    const [statsFilename, setStatsFilename] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        setCurrOutput({
            ...outputFromPrevPage,
            "ResourceUtilization": JSON.parse(JSON.parse(outputFromPrevPage["ResourceUtilization"])),
            "OverallScenarioStatistics": JSON.parse(JSON.parse(outputFromPrevPage["OverallScenarioStatistics"])),
            "IndividualTaskStatistics": JSON.parse(JSON.parse(outputFromPrevPage["IndividualTaskStatistics"])),
        })
    }, [outputFromPrevPage]);

    useEffect(() => {
        if (currOutput) {
            setLogsFilename(currOutput!["LogsFilename"])
            setStatsFilename(currOutput!["StatsFilename"])
        }
    }, [currOutput]);

    const onLogFileDownload = () => {
        downloadSimulationFile(logsFilename)
    };

    const onStatsDownload = () => {
        downloadSimulationFile(statsFilename)
    };

    const onClickSaveToProject = () => {
        const files = [statsFilename, logsFilename]
        console.log("Saving files to project")
        for (const f in files) {
            axios
              .get(`/api/prosimos/simulationFile?fileName=${files[f]}`)
              .then((data: any) => {
                  const mimeType = "text/csv"
                  const blob = new Blob([data.data], { type: mimeType })
                  const file = new File([blob], files[f])
                  onSaveToProject(file, "UNTAGGED")
              })
              .catch((error: any) => {
                  console.log(error.response)
                  setErrorMessage(error.response.data.displayMessage)
              })
        }
    }

    const downloadSimulationFile = (filename: string) => {
        axios
            .get(`/api/prosimos/simulationFile?fileName=${filename}`)
            .then((data: any) => {
                const mimeType = "text/csv"
                const blob = new Blob([data.data], { type: mimeType })
                const url = URL.createObjectURL(blob)

                const link = document.createElement('a')
                const category = filename.split("_")[0]
                link.download = category
                link.href = url

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            })
            .catch((error: any) => {
                console.log(error.response)
                setErrorMessage(error.response.data.displayMessage)
            })
    };

    const onSnackbarClose = () => {
        setErrorMessage("")
    };

    return (<>
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            className={classes.resultsGrid}
        >
            <Grid container item xs={10}>
                <Grid item xs={6} justifyContent="flex-start">
                </Grid>
                <Grid item container xs={6} justifyContent="flex-end">
                    <ButtonGroup>
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          onClick={onClickSaveToProject}
                          size="small"
                        >
                            Save to Project
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={onStatsDownload}
                            size="small"
                        >
                            Download stats
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={onLogFileDownload}
                            size="small"
                        >
                            Download logs
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
            <Grid item xs={10} className={classes.resultsGrid}>
                {currOutput && <ScenarioStatistics
                    data={currOutput["OverallScenarioStatistics"]}
                />}
            </Grid>
            <Grid item xs={10} className={classes.resultsGrid}>
                {currOutput && <TaskStatistics
                    data={currOutput["IndividualTaskStatistics"]}
                />}
            </Grid>
            <Grid item xs={10} className={classes.resultsGrid} style={{ marginBottom: "1%" }}>
                {currOutput && <ResourceUtilization
                    data={currOutput["ResourceUtilization"]}
                />}
            </Grid>
        </Grid>
        <CustomizedSnackbar
            message={errorMessage}
            onSnackbarClose={onSnackbarClose}
        />
    </>)
}

export default SimulationResults;
