import { useEffect, useRef } from 'react';
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import { Grid, Paper, Typography } from '@mui/material';

const BPMNModelViewer = () => {
    const xmlData = localStorage.getItem("bpmnContent")
    const modelViewerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!!xmlData) {
            const bpmnViewer = new BpmnViewer({
                container: "#canvas"
            })

            const onImportXml = async () => {
                const result = await bpmnViewer.importXML(xmlData)
                const { warnings } = result;
                if (warnings.length === 0) {
                    const canvas = bpmnViewer.get('canvas')
                    canvas.zoom('fit-viewport')
                } 
            };

            try {
                onImportXml()
            } catch (err: any) {
                console.log(err.message, err.warnings);
            }
        }
    }, [xmlData]);

    return (<Grid container alignItems="center" justifyContent="center" style={{ width: "100%", height: "100%", marginTop: "3vh" }}>
        <Grid container alignItems="center" justifyContent="center" style={{ width: "100%", height: "80vh" }}>
            <Grid item xs={10} style={{ height: "100%" }} >
                <Paper style={{ height: "80vh" }} sx={{ p: 2 }}>
                    <Typography variant="h6"> Model Viewer </Typography>
                    {(xmlData === null) && <span>No BPMN file found</span>}
                    <div
                        id="canvas"
                        ref={modelViewerRef}
                        style={{ width: "100%", height: "70vh", padding: "2vh" }}
                    />
                </Paper>
            </Grid>
        </Grid>
    </Grid>
    )
}

export default BPMNModelViewer;
