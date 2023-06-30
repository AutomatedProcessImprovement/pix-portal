import {
  AlertColor,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import * as React from "react";
import {useEffect, useState} from "react";
import PFile from "./PFile";
import DropZoneArea from "../Upload/DropzoneArea";
import ConfirmDialog from "../CustomComponents/ConfirmDialog";
import PixSnackBar from "../PIXSnackBar/PixSnackBar";
import paths from "../../router/paths";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CreateProjectDialog from "../Upload/CreateProjectDialog";
import {getProjectFiles} from "../../api/project_api";
import {editExistingFileTitle, getProjectFileForDownload, removeProjectFile, uploadFile} from "../../api/file_api";
import {theme} from "../../themes/ChipTheme";
import {MenuProps} from "../../themes/MenuPropsProjectPage";
import {colors, fileTags, Selectable, tValToActual} from "../../helpers/mappers";
import ToolSelectionMenu from "../CustomComponents/ToolSelectionMenu/ToolSelectionMenu";

interface ProjectProps {
  pid: number
  projectName: string,
  projectCreationDate: string,
  uuid: number
  // userName: string
}

const ProjectPage = ({auth, userManager}) => {
  const navigate = useNavigate();
  const state = useLocation();
  const { uuid, projectName, projectCreationDate, pid } = state.state as ProjectProps

  /** STUFF FOR DROPZONE COMPONENT*/
  const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
  const [dropzoneFiles, setDropzoneFiles] = useState([]);
  const [tagValue, setTagValue] = React.useState<string>("UNTAGGED");

  const [fList, setFlist] = useState([])

  /** STUFF FOR PROJECT SELECTION CHECKBOX*/
  const [selectedProjectFiles, setSelectedProjectFiles] = useState([])
  const [uniqueTags, setUniqueTags] = useState([])

  const [open, setOpen] = useState(false);
  const [fid, setFid] = useState(null);
  const [fName, setFName] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectable, setSelectable] = useState<Selectable>({
    SIMOD: false,
    PROSIMOS: false,
    OPTIMOS: false,
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createDialogTitle, setCreateDialogTitle] = useState("")
  const [createDialogMessage, setCreateDialogMessage] = useState("")

  const [snackMessage, setSnackMessage] = useState("")
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)

  useEffect(() => {
    collectFiles(pid)
  }, [state.state])

  useEffect(() => {
    for (const key in selectedProjectFiles) {
      for (const selKey in selectedProjectFiles[key].tags) {
        if (uniqueTags.indexOf(selectedProjectFiles[key].tags[selKey]) === -1) {
          setUniqueTags(uniqueTags.concat(selectedProjectFiles[key].tags[selKey]))
        }
      }
    }
  }, [selectedProjectFiles, uniqueTags])

  useEffect(() => {
    const hasEventLog = uniqueTags.includes('EVENT_LOG');
    const hasSimModel = uniqueTags.includes('SIM_MODEL');
    const hasBpmn = uniqueTags.includes('BPMN');
    const hasConsModel = uniqueTags.includes('CONS_MODEL');

    setSelectable((prevSelectable) => ({
      SIMOD: hasEventLog,
      PROSIMOS: hasSimModel && hasBpmn,
      OPTIMOS: hasConsModel && hasSimModel && hasBpmn,
    }));
}, [uniqueTags]);

  const collectFiles = (pid) => {
    const _ = getProjectFiles(pid).then((result:any) => {
      const jsonFiles = result.data.files
      setFlist(jsonFiles)
    }).catch((e)=> {
      console.log(e)
    })
  }

  const handleOpenToolSelectionMenu = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleCloseToolSelectionMenu = (e:string) => {
    console.log(e)
    setAnchorEl(null);
  };

  /** DIALOG HANDLING FUNCTIONS */
  const handleOpenEditDialog = (fid, prevName) => {
    setFid(fid)
    setFName(prevName)
    setCreateDialogMessage("Enter a new name for the file")
    setCreateDialogTitle("Edit existing file")
    setOpenCreateDialog(true);
  }

  const handleOpenRemoveDialog = (fid: number) => {
    setOpen(true)
    setFid(fid)
  }

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreateDialogTitle("")
    setCreateDialogMessage("")
  };

  const handleCloseRemoveDialog = (e) => {
    if (e && fid) {
      handleRemoveFile(fid)
    }
    setFid(null)
    setOpen(false);
  }

  /** API CALL FUNCTIONS */
  const handleRemoveFile = (fid) => {
    const _ = removeProjectFile(fid).then((results: any) => {
      setSuccessMessage(results.data.message)
      collectFiles(pid)
    }).catch((e)=> {
      setErrorMessage(e.data.message)
    })
  }

  const handleUploadFile = () => {
    const actual = tValToActual[tagValue]

    if (selectedLogFile) {
      uploadFile(selectedLogFile, [actual], pid).then(
        (e) => {
          collectFiles(pid)
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

  const handleEditFile = (_type, e: string) => {
    const _ = editExistingFileTitle(fid, e).then((_e:any) => {
      setSuccessMessage(_e.data.message)
      collectFiles()
      handleCloseCreateDialog()
    });
  }

  const handleDownloadFile = (fid: number) => {
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
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
  }

  /** HANDLE MULTI FILE SELECTION FUNCTIONS - CHECKBOX*/
  const handleCheckboxChange = (event: SelectChangeEvent<typeof tagValue>) => {
    const {
      target: { value },
    } = event;
    setTagValue(
      value
    );
  };

  const handleFileChecked = (checked, fileID, tags) => {
    if (!checked) {
      const checkFileExists = fileId => selectedProjectFiles.some( ({uuid}) => uuid == fileId)
      if (checkFileExists(fileID)) {
        setSelectedProjectFiles(selectedProjectFiles.filter(obj => obj.uuid !== fileID))
        setUniqueTags(uniqueTags.filter(obj => obj !== tags[0]))
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

  const contentToBlob = (values, name) => {
    const filetype = name.split('.')[1]
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

  /** SNACKBAR STUFF*/
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

  const handleNavigateBack = () => {
    navigate(
      paths.LOGIN_PATH
    )
  }

  return (
    <Box
      sx={{
        pt: 4,
        pb: 4,
      }}
    >
      <Container sx={{ py: 3, minWidth: '65%' }}>
        <Box
          sx={{display: 'flex', justifyContent: 'space-between', pb: 2}}
        >
          <>
            <IconButton aria-label="delete" onClick={handleNavigateBack}>
              <ArrowBackIosIcon />
            </IconButton>
          </>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            color="text.primary"
          >
            {projectName}
          </Typography>
          <>
            <IconButton aria-label="download-all" onClick={handleOpenToolSelectionMenu}>
              <CloudDownloadIcon />
            </IconButton>
          </>
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
                onChange={handleCheckboxChange}
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
          <Button sx={{width: 400}} variant="contained" onClick={handleUploadFile}>Upload File</Button>

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
              <Grid item key={id} xs={3}>
                <PFile
                  key={id}
                  name={name}
                  path={path}
                  tag={tags}
                  uploadDate={createdOn}
                  uuid={id}
                  onRemove={handleOpenRemoveDialog}
                  onChange={handleFileChecked}
                  onDownload={handleDownloadFile}
                  onEdit={handleOpenEditDialog}/>
              </Grid>
          ))}
        </Grid>
      </Container>
      <ConfirmDialog
        message={"Are you sure you want to delete this file?"}
        onClose={handleCloseRemoveDialog}
        open={open}
        title={"Delete file?"}
      />
      <CreateProjectDialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        onSubmit={handleEditFile}
        message={createDialogMessage}
        title={createDialogTitle}
        type={"FILE"}
        value={fName}/>
      < ToolSelectionMenu
        anchorEl={anchorEl}
        onClose={handleCloseToolSelectionMenu}
        selectable={selectable}
      />
      {snackMessage && <PixSnackBar
          message={snackMessage}
          severityLevel={snackColor}
          onSnackbarClose={onSnackbarClose}
      />}
    </Box>
  )
}

export default ProjectPage