import React, {useState} from 'react';
import {AlertColor, Grid, Paper, TextField, Typography} from "@mui/material";
import {useNavigate} from 'react-router-dom';
import {LoadingButton} from '@mui/lab';
import axios from "axios";
import paths from "../router/paths";
import CustomizedSnackbar from "./CustomizedSnackBar";


const Upload = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedID, setSeletedID] = useState<String>('');

    const [snackMessage, setSnackMessage] = useState("")
    const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)


    const setInfoMessage = (value: string) => {
        setSnackColor("info")
        setSnackMessage(value)
    };

    const setErrorMessage = (value: string) => {
        setSnackColor("error")
        setSnackMessage(value)
    };

    const onSnackbarClose = () => {
        setInfoMessage("")
        setErrorMessage("")
    };

    const onChangeID = (event: any) => {
        setSeletedID(event.target.value)
    }
    const navigate = useNavigate();

    const handleValidRequest = (values: any) => {
        if (selectedID !== null) {
            console.log(values)
            try {
                const config = {
                    method: 'get',
                    url: 'http://193.40.11.233/jobs' + selectedID,
                };
                axios(
                    config
                ).then(((r: any) => {
                    let j = r.data
                    let logN = r.id
                    navigate(paths.DASHBOARD_PATH, {
                        state: {
                            jsonLog: j.result,
                            report: j,
                            logName: logN as String
                        }
                    })
                    setLoading(false)
                })).catch((error: any) => {

                    setErrorMessage(error)
                    setLoading(false)
                })
            } catch (error: any) {
                setErrorMessage(error)
                setLoading(false)
            }
        }
    }

    return (
        <>
            <br/>
            <br/>
            <Grid container alignItems="center" justifyContent="center" spacing={4} style={{paddingTop: '10px'}}
                  className="centeredContent">
                <Grid item xs={6}>
                    <Paper elevation={5} sx={{p: 3, minHeight: '10vw'}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h4" align="center">
                                    Search for a processed result (ID)
                                </Typography>
                                <br/>

                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="outlined-name"
                                    label="Identifier"
                                    sx={{width: '50%'}}
                                    onChange={onChangeID}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <LoadingButton
                        variant="contained"
                        onClick={handleValidRequest}
                        loading={loading}
                    >
                        Get results
                    </LoadingButton>
                </Grid>
            </Grid>
            {snackMessage && <CustomizedSnackbar
                message={snackMessage}
                severityLevel={snackColor}
                onSnackbarClose={onSnackbarClose}
            />}
        </>
    );
}

export default Upload;