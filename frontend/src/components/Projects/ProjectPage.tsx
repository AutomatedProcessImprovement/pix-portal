import {
  AlertColor,
  Box,
  Button,
  Chip,
  Container,
  Grid, IconButton,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import {useLocation} from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import * as React from "react";
import {useEffect, useState} from "react";
import PFile from "./PFile";
import {getProjectFileForDownload, getProjectFiles, removeProjectFile, uploadFile} from "../../api/api";
import DropZoneArea from "../Upload/DropzoneArea";
import {createTheme} from '@mui/material/styles';
import ConfirmDialog from "../CustomComponents/ConfirmDialog";
import PixSnackBar from "../PIXSnackBar/PixSnackBar";
import paths from "../../router/paths";
import {useNavigate} from 'react-router-dom';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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

const ProjectPage = ({auth, userManager}) => {

  const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
  const [dropzoneFiles, setDropzoneFiles] = useState([]);
  const [tagValue, setTagValue] = React.useState<string>("UNTAGGED");

  const [selectedProjectFiles, setSelectedProjectFiles] = useState([])
  const [uniqueTags, setUniqueTags] = useState([])

  const [open, setOpen] = useState(false);
  const [fid, setFid] = useState(null);

  const [snackMessage, setSnackMessage] = useState("")
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)

  const navigate = useNavigate();
  const state = useLocation();
  const { pInfo } = state.state as ProjectProps
  const [fList, setFlist] = useState(files)

  useEffect(() => {
    collectFiles()
  }, [])

  useEffect(() => {
    for (const key in selectedProjectFiles) {
      for (const selKey in selectedProjectFiles[key].tags) {
        if (uniqueTags.indexOf(selectedProjectFiles[key].tags[selKey]) === -1) {
          setUniqueTags(uniqueTags.concat(selectedProjectFiles[key].tags[selKey]))
        }
      }
    }
  }, [selectedProjectFiles, uniqueTags])


  const handleFileChecked = (checked, fileID, tags) => {
    if (!checked) {
      const checkFileExists = fileId => selectedProjectFiles.some( ({uuid}) => uuid == fileId)
      if (checkFileExists(fileID)) {
        const res = selectedProjectFiles.filter(obj => obj.uuid !== fileID);
        setSelectedProjectFiles(res)
        const res2 = uniqueTags.filter(obj => obj !== tags[0]);
        setUniqueTags(res2)
        return false
      }
    } else {
      const newObj = {
        'uuid': fileID,
        'tags': tags
      }

      const checkFileExists = fileId => selectedProjectFiles.some(({uuid}) => uuid == fileId )
      if (!checkFileExists(newObj.uuid)) {
        for (const nk in newObj.tags) {
          if (uniqueTags.indexOf(newObj.tags[nk]) === -1) {
            console.log("adding file");
            setUniqueTags(uniqueTags.concat(newObj.tags[nk]));
            setSelectedProjectFiles(selectedProjectFiles.concat(newObj));
            return true
          } else {
            setErrorMessage(
              `You can only have one file of type : ${newObj.tags[nk]} selected.`)
            return false
          }
        }
      }
    }
  }




  const collectFiles = () => {
    const _ = getProjectFiles(pInfo.uuid).then((result:any) => {
      const jsonFiles = result.data.files
      setFlist(jsonFiles)
    })
  }

  const handleRemove = (fid: number) => {
    // console.log(fid)
    setOpen(true)
    setFid(fid)
  }

  const contentToBlob = (values, name) => {
    const filetype = name.split('.')[1]
    console.log(filetype)
    let contentType;
    switch (filetype) {
      case 'json':
        contentType = 'application/json'
        break
      case 'bpmn':
        contentType = 'application/xml'
        break
      case 'csv':
        contentType = 'text/csv'
        break
      default:
        contentType = 'text/plain'
    }

    const content = JSON.stringify(values)
    return new Blob([content], {type: contentType})
  }

  const handleDownload = (fid: number) => {
    const _ = getProjectFileForDownload(fid)
      .then((results: any) => [contentToBlob(results.data.file.content, results.data.file.name), results.data.file.name])
      .then(([blob, name]) => {
        const fileDownloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a');

        link.href = fileDownloadUrl;
        link.setAttribute(
          'download',
          name
        );
        // Append to html link element page
        document.body.appendChild(link);
        // Start download
        link.click();
        // Clean up and remove the link
        link.parentNode.removeChild(link);
      })
  }

  const handleClickTest = () => {

    const actual = tValToActual[tagValue]

    if (selectedLogFile) {
      uploadFile(selectedLogFile, [actual], pInfo.uuid).then(
        (e) => {
          console.log(e)
          collectFiles()
          setTagValue("UNTAGGED")
          setSelectedLogFile(null)
          setDropzoneFiles([])

          setSuccessMessage(e.data.message)
        }
      ).catch((e) => {
        setErrorMessage(e.data.message)
      });
    } else {
      setErrorMessage("Please select a file to upload")
    }


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

  const onSnackbarClose = () => {
    setSuccessMessage("")
    setInfoMessage("")
    setErrorMessage("")
  };

  const setInfoMessage = (value: string) => {
    setSnackColor("info")
    setSnackMessage(value)
  };

  const setSuccessMessage = (value: string) => {
    setSnackColor("success")
    setSnackMessage(value)
  };

  const setErrorMessage = (value: string) => {
    setSnackColor("error")
    setSnackMessage(value)
  };

  const goBack = () => {
    navigate(
      paths.LOGIN_PATH
    )
  }

  const handleChange = (event: SelectChangeEvent<typeof tagValue>) => {
    const {
      target: { value },
    } = event;

    setTagValue(
      value
    );
  };

  const removeFile = (fid) => {
    const _ = removeProjectFile(fid).then((results: any) => {
       //TODO snackbar
      setSuccessMessage(results.data.message)
      collectFiles()
    }).catch((e)=> {
      setErrorMessage(e.data.message)
    })
  }

  const handleClose = (e) => {
    if (e && fid) {
      removeFile(fid)
    }
    setFid(null)
    setOpen(false);
  };

  return (
      <Box
        sx={{
          pt: 4,
          pb: 4,
        }}
      >


        <Container sx={{ py: 3, minWidth: '65%' }}>
          <Box
            sx={{display: 'flex', justifyContent: 'space-between', pb: 4}}
          >
            <IconButton aria-label="delete" onClick={goBack}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              color="text.primary"
            >
              {pInfo.projectName}
            </Typography>
            <IconButton aria-label="download-all">
              <CloudDownloadIcon />
            </IconButton>
          </Box>
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
            useFlexGap
            flexWrap="wrap"
          >
            <Button sx={{width: 400}} variant="contained" onClick={handleClickTest}>Upload File</Button>

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
                onClickRemove={handleRemove}
                onChange={handleFileChecked}
                onClickDownload={handleDownload}/>
            ))}
          </Grid>
        </Container>
        <ConfirmDialog
          message={"Are you sure you want to delete this file?"}
          onClose={handleClose}
          open={open}
          title={"Delete file?"}/>
        {snackMessage && <PixSnackBar
            message={snackMessage}
            severityLevel={snackColor}
            onSnackbarClose={onSnackbarClose}
        />}
      </Box>
  )
}

export default ProjectPage