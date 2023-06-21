import {
  Box,
  Button, Chip,
  Container,
  Grid, MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography
} from "@mui/material";
import {useLocation} from "react-router-dom";

import * as React from "react";
import PFile from "./PFile";
import {useEffect, useState} from "react";
import {getProjectFiles, getProjects, uploadFile} from "../../api/api";
import DropZoneArea from "../Upload/DropzoneArea";
import {ProjectFile} from "../../types/types";

interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userName: string
}



const files = [
  // {uuid: uuidv4(), path: "/some/path/model.bpmn", tag: "BPMN", uploadDate: "SOMEDATE", name: "Model"},
  // {uuid: uuidv4(), path: "/some/path/simmodel.json", tag: "SIMMODEL", uploadDate: "SOMEDATE", name: "loan_application"},
  // {uuid: uuidv4(), path: "/some/path/eventlog.csv", tag: "EVLOG", uploadDate: "SOMEDATE", name: "Load Event Log"},
  // {uuid: uuidv4(), path: "/some/path/eventlog.csv", tag: "", uploadDate: "SOMEDATE", name: "FileName"},
]

const ProjectPage = () => {

  const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
  const [tagValue, setTagValue] = React.useState<string>("");


  useEffect(() => {
    console.log("Mounted")
    collectFiles()
  }, [])

  const state = useLocation();
  const { pInfo } = state.state as ProjectProps
  const [fList, setFlist] = useState(files)

  const collectFiles = () => {
    const files = getProjectFiles(pInfo.uuid).then((result:any) => {
      const jsonFiles = result.data.files
      // console.log(jsonFiles)
      setFlist(jsonFiles)
    })
  }

  const handleClickTest = () => {
    uploadFile(selectedLogFile, [tagValue], pInfo.uuid).then(
      (e) => {
        console.log(e)
        collectFiles()
      }
    );
  };

  const onFinishUpload = () => {
    setSelectedLogFile(null)
    setTagValue("")
  }

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

  const fileTags = [
    'BPMN',
    'EVENT_LOG',
    'SIM_MODEL',
    'CONS_MODEL'
  ];

  const colors = {
    'BPMN': 'primary',
    'EVENT_LOG': 'success',
    'SIM_MODEL': 'secondary',
    'CONS_MODEL': 'error'
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
              <Grid item xs={8}>
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
                />
              </Grid>
            <Grid item xs={4}>
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
                sx={{ width: '100%'}}
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                value={tagValue}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip key={selected} label={selected} color={colors[selected]}/>
                  </Box>
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
            <Stack
              sx={{ pt: 1 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={handleClickTest}>Upload</Button>
            </Stack>
          </Paper>
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
            {fList.map(({uuid, path, tags, uploadDate, name}) => (
              <PFile
                key={uuid}
                 name={name}
                 path={path}
                 tag={tags}
                 uploadDate={uploadDate}
                 uuid={uuid}
              />
            ))}
          </Grid>
        </Container>
      </Box>
  )
}

export default ProjectPage