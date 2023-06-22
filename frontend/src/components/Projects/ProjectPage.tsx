import {
  Box,
  Button, Chip,
  Container,
  Grid, MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack, ThemeProvider,
  Typography
} from "@mui/material";
import {useLocation} from "react-router-dom";

import * as React from "react";
import PFile from "./PFile";
import {useEffect, useState} from "react";
import {getProjectFiles, removeProjectFile, uploadFile} from "../../api/api";
import DropZoneArea from "../Upload/DropzoneArea";
import { createTheme } from '@mui/material/styles';
interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userName: string
}

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    bpmn: {
      main: '#ffc107',
      contrastText: '#fff',
    },
    event_log: {
      main: '#009688',
      contrastText: '#fff',
    },
    sim_model: {
      main: '#2196f3',
      contrastText: '#fff',
    },
    cons_model: {
      main: '#7e57c2',
      contrastText: '#fff',
    },
    untagged: {
      main: '#ef5350',
      contrastText: '#fff',
    },
  },
});


const files = []

const ProjectPage = () => {

  const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
  const [dropzoneFiles, setDropzoneFiles] = useState<>([]);
  const [tagValue, setTagValue] = React.useState<string>("UNTAGGED");


  useEffect(() => {
    collectFiles()
  }, [])

  const state = useLocation();
  const { pInfo } = state.state as ProjectProps
  const [fList, setFlist] = useState(files)


  const collectFiles = () => {
    const _ = getProjectFiles(pInfo.uuid).then((result:any) => {
      const jsonFiles = result.data.files
      setFlist(jsonFiles)
    })
  }

  const handleRemove = (fid: number) => {
    // console.log(fid)
    const _ = removeProjectFile(fid).then((results: any) => {
      // TODO snackbar
      collectFiles()
    })
  }

  const handleClickTest = () => {

    const actual = tValToActual[tagValue]

    uploadFile(selectedLogFile, [actual], pInfo.uuid).then(
      (e) => {
        console.log(e)
        collectFiles()
        setTagValue("UNTAGGED")
        setSelectedLogFile(null)
        setDropzoneFiles([])
      }
    );
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 500,
      },
    },
  };

  const colors = {
    'BPMN': 'bpmn',
    'EVENT LOG': 'event_log',
    'SIM MODEL': 'sim_model',
    'CONS MODEL': 'cons_model',
    'UNTAGGED': 'untagged'
  }


  const fileTags = [
    'BPMN',
    'EVENT LOG',
    'SIM MODEL',
    'CONS MODEL',
    'UNTAGGED'
  ];

  const tValToActual = {
    'BPMN': 'BPMN',
    'EVENT LOG': 'EVENT_LOG',
    'SIM MODEL': 'SIM_MODEL',
    'CONS MODEL': 'CONS_MODEL',
    'UNTAGGED': 'UNTAGGED'
  }



  const handleChange = (event: SelectChangeEvent<typeof tagValue>) => {
    const {
      target: { value },
    } = event;

    setTagValue(
      value
    );
  };

  return (
      <Box
        sx={{
          pt: 4,
          pb: 4,
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {pInfo.projectName}
        </Typography>

        <Container sx={{ py: 3, minWidth: '65%' }}>
          <Paper
            elevation={2}
            sx={{
              p: 2
            }}
          >
            <Grid
              container
              spacing={2}
              direction="row"
              justify="space-between"
              alignItems="center-top"
              >
              <Grid item xs={10}>
                <Typography
                  component="h1"
                  variant="h5"
                  align="center"
                  color="text.primary"
                  gutterBottom
                >
                  Upload File
                </Typography>
                <DropZoneArea
                  acceptedFiles={'.json,.xes,.bpmn,.csv'}
                  setSelectedLogFile={setSelectedLogFile}
                  extFiles={dropzoneFiles}
                  setExtFiles={setDropzoneFiles}/>
              </Grid>
            <Grid item xs={2}>
              <Typography
                component="h1"
                variant="h5"
                align="center"
                color="text.primary"
                gutterBottom
              >
                Select Tag
              </Typography>
              <Select
                displayEmpty
                sx={{ width: '100%'}}
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                value={tagValue}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                  <ThemeProvider theme={theme}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip key={selected} label={selected} color={colors[selected]}/>
                    </Box>
                  </ThemeProvider>
                )}
                MenuProps={MenuProps}
              >

                {fileTags.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    // style={getStyles(name, personName, theme)}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            </Grid>
          </Paper>
          <Stack
            sx={{ pt: 3 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Button variant="contained" onClick={handleClickTest}>Upload</Button>
          </Stack>
        </Container>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
        >
          Project Files
        </Typography>

        <Container sx={{ py: 5, minWidth: '65%' }}>
          <Grid container spacing={4}>
            {fList.map(({id, path, tags, createdOn, name}) => (
              <PFile
                key={id}
                name={name}
                path={path}
                tag={tags}
                uploadDate={createdOn}
                uuid={id}
                onClickRemove={handleRemove}/>
            ))}
          </Grid>
        </Container>
      </Box>
  )
}

export default ProjectPage