import {
  AlertColor,
  Box,
  Button,
  Chip,
  Container, Divider,
  Grid,
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
import DropZoneArea from "../pixUpload/DropzoneArea";
import ConfirmDialog from "../pixConfirmDialog/ConfirmDialog";
import PixSnackBar from "../PIXSnackBar/PixSnackBar";
import paths from "../../../router/pix/pix_paths";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CreateProjectDialog from "../pixUpload/CreateProjectDialog";
import {getProjectFiles} from "../../../api/pix_project_api";
import {
  editExistingFileTitle,
  getProjectFileForDownload,
  removeProjectFile,
  uploadFile
} from "../../../api/pix_file_api";
import {theme} from "../../../themes/ChipTheme";
import {MenuProps} from "../../../themes/MenuPropsProjectPage";
import {colors, fileTags, Selectable, tValToActual} from "../../../helpers/mappers";
import prosimos_paths from "../../../router/prosimos/prosimos_paths";
import ToolSelectionButtonGroup from "../pixToolSelectionButtonGroup/ToolSelectionButtonGroup";
import JSZip from "jszip";
import FileSaver  from 'file-saver';

interface ProjectProps {
  pid: string
  projectName: string,
  projectCreationDate: string,
  uuid: number
  // userName: string
}

const ProjectPage = () => {
  const navigate = useNavigate();
  const state = useLocation();
  const { projectName, pid } = state.state as ProjectProps

  /** STUFF FOR DROPZONE COMPONENT*/
  const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
  const [dropzoneFiles, setDropzoneFiles] = useState([]);
  const [tagValue, setTagValue] = React.useState<string>("None");

  const [fList, setFlist] = useState<{File:any, Tag:any}[]>([])

  /** STUFF FOR PROJECT SELECTION CHECKBOX*/
  const [selectedProjectFiles, setSelectedProjectFiles] = useState<any>([])
  const [uniqueTags, setUniqueTags] = useState<any>([])

  const [open, setOpen] = useState(false);
  const [fid, setFid] = useState<any>(null);
  const [fName, setFName] = useState<any>("");

  // @ts-ignore
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

  const zip = new JSZip();

  useEffect(() => {
    collectFiles(pid)
  }, [state.state])

  useEffect(() => {
    for (const key in selectedProjectFiles) {
      if (uniqueTags.indexOf(selectedProjectFiles[key].tags) === -1) {
        setUniqueTags(uniqueTags.concat(selectedProjectFiles[key].tags))
      }
    }
  }, [selectedProjectFiles, uniqueTags])

  useEffect(() => {
    const hasEventLog = uniqueTags.includes('EVENT_LOG');
    const hasSimModel = uniqueTags.includes('SIM_MODEL');
    const hasBpmn = uniqueTags.includes('BPMN');
    const hasConsModel = uniqueTags.includes('CONS_MODEL');

    setSelectable(() => ({
      SIMOD: hasEventLog,
      PROSIMOS: hasSimModel && hasBpmn,
      OPTIMOS: hasConsModel && hasSimModel && hasBpmn,
    }));
}, [uniqueTags]);

  const collectFiles = (pid:any) => {
    getProjectFiles(pid).then((result:any) => {
      const fileTagObjects = result.data.files
      setFlist(fileTagObjects)
    }).catch((e)=> {
      console.log(e)
    })
  }

  const handleCloseToolSelectionMenu = async (e:string) => {
    if (selectedProjectFiles.length == 0) {
      setErrorMessage("You must select at least one file.")
      return
    }
    console.log()
    if (e === 'PROSIMOS') {
      let files = {'bpmn': null, 'json': null};
      if (uniqueTags.indexOf("BPMN") == -1) {
        setErrorMessage("You must select at least a BPMN file for Prosimos")
        return
      }
      for (const fileKey in selectedProjectFiles) {
        getProjectFileForDownload(selectedProjectFiles[fileKey].path).then((_res: any)=> {
          console.log(_res)
          console.log(_res.data)
          if (selectedProjectFiles[fileKey].tags === 'BPMN') {
            // @ts-ignore
            files.bpmn = new File([_res.data], selectedProjectFiles[fileKey].uuid + ".bpmn")
          }
          if (selectedProjectFiles[fileKey].tags === 'SIM_MODEL') {
            // @ts-ignore
            files.json = new File([_res.data], selectedProjectFiles[fileKey].uuid + ".json")
          }
        })
      }

      console.log(files.bpmn)
      navigate(
        prosimos_paths.SIMULATOR_SCENARIO_PATH, {
          state: {
            'bpmnFile': files.bpmn,
            'jsonFile': files.json,
            'projectId': pid
          }
        }
      )
    }
    else {
      setErrorMessage("You cannot go here yet. ");
    }
  };

  /** DIALOG HANDLING FUNCTIONS */
  const handleOpenEditDialog = (fid:any, prevName:any) => {
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

  const handleCloseRemoveDialog = (e:any) => {
    if (e && fid) {
      handleRemoveFile(fid)
    }
    setFid(null)
    setOpen(false);
  }

  /** API CALL FUNCTIONS */
  const handleRemoveFile = (fid:any) => {
    removeProjectFile(fid).then((results: any) => {
      setSuccessMessage(results.data.message)
      collectFiles(pid)
    }).catch((e)=> {
      setErrorMessage(e.data.message)
    })
  }

  const handleUploadFile = () => {
    const actual = (tValToActual as any)[tagValue]

    if (!actual) {
      setErrorMessage("Please select a valid tag.")
      return
    }

    if (selectedLogFile) {
      uploadFile(selectedLogFile, actual, pid).then(
        (e) => {
          collectFiles(pid)
          setTagValue("None")
          setSelectedLogFile(null)
          setDropzoneFiles([])
          setSuccessMessage(e.data.message)
        }
      ).catch((e) => {
        setErrorMessage(e.data.message)
      });
    } else {
      setErrorMessage("Please select a file to upload");
    }
  };

  const handleEditFile = (_type:any, e: string) => {
    editExistingFileTitle(fid, e).then((_e:any) => {
      setSuccessMessage(_e.data.message)
      collectFiles(pid)
      handleCloseCreateDialog()
    });
  }

  const handleDownloadFile = async (path: string, filename:any) => {
    getProjectFileForDownload(path).then((_res: any) => {
      // Create a temporary anchor element to download the file
      console.log(_res)
      const url = URL.createObjectURL(new Blob([_res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch((err) => {
      console.error('Error downloading file:', err);
    })
  }

  const handleDownloadEntireProject = async () => {
    console.log(fList)
    let projectZip = zip.folder(`${projectName}`);
    for (const file in fList) {
      console.log(fList[file].File.path)
      getProjectFileForDownload(fList[file].File.path).then((_res:any)=> {
        let blob = new Blob([_res.data], {type: _res.data.contentType})
        // @ts-ignore
        projectZip.file(fList[file].File.name+"."+fList[file].File.extension, blob)
      })

    }
    zip.generateAsync({type:'blob'})
      .then((res:any) => {
        console.log(res)
        FileSaver.saveAs(res, projectName);
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

  const handleFileChecked = (checked:boolean, fileID:any, tags:any, path:any) => {
    if (!checked) {
      const checkFileExists = (fileId:any) => selectedProjectFiles.some( ({uuid}:any) => uuid == fileId)
      if (checkFileExists(fileID)) {
        setSelectedProjectFiles(selectedProjectFiles.filter((obj:any) => obj.uuid !== fileID))
        setUniqueTags(uniqueTags.filter((obj:any) => obj !== tags))
        return false
      }
    } else {
      const newObj = {
        'uuid': fileID,
        'tags': tags,
        'path': path
      }
      const checkFileExists = (fileId:any) => selectedProjectFiles.some(({uuid}:any) => uuid == fileId )
      if (!checkFileExists(newObj.uuid)) {
        if (uniqueTags.indexOf(newObj.tags) === -1) {
          setUniqueTags(uniqueTags.concat(newObj.tags));
          setSelectedProjectFiles(selectedProjectFiles.concat(newObj));
          return true
        } else {
          setErrorMessage(
            `You can only have one file of type : ${newObj.tags} selected.`)
          return false
        }
      }
    }
    return false
  }

  // const contentToBlob = (values:any, name:any) => {
  //   const filetype = name.split('.')[1]
  //   let contentType;
  //   switch (filetype) {
  //     case 'json':
  //       contentType = 'application/json'
  //       break
  //     case 'bpmn':
  //       contentType = 'application/xml'
  //       break
  //     case 'csv':
  //       contentType = 'text/csv'
  //       break
  //     default:
  //       contentType = 'text/plain'
  //   }
  //   const content = JSON.stringify(values)
  //   return new Blob([content], {type: contentType})
  // }

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
      <Container sx={{minWidth: '75%'}}>
          <Box
            sx={{display: 'flex', justifyContent: 'space-between', pb: 2}}
          >
            <>
              <Button variant={'outlined'} key="back" sx={{	display: 'flex', justifyContent: 'left'}}  onClick={handleNavigateBack} startIcon={<ArrowBackIosIcon />}>My Projects</Button>
              {/*<IconButton aria-label="delete">*/}
              {/*  <ArrowBackIosIcon />*/}
              {/*</IconButton>*/}
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
              <Button variant={'outlined'} key="back" sx={{	display: 'flex', justifyContent: 'left'}}  onClick={handleDownloadEntireProject} endIcon={<CloudDownloadIcon />}>Download project</Button>
              {/*<IconButton aria-label="download-all" >*/}
              {/*  <CloudDownloadIcon />*/}
              {/*</IconButton>*/}
            </>
          </Box>
        <Divider variant="middle" sx={{mb:4, mt: 2, ml: '15%', mr: '15%'}}/>
          <Grid
            container
            spacing={2}
            columns={14}
            direction="row"
            alignItems="center-top"
          >
            <Grid item xs={2}>
              <ToolSelectionButtonGroup onClose={handleCloseToolSelectionMenu} />
            </Grid>
            <Grid item xs={10}>
              <Paper
                elevation={2}
                sx={{
                  p: 2
                }}
              >
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
              </Paper>
            </Grid>
            <Grid item xs={2}>
              <Paper
                elevation={2}
                sx={{
                  p: 2
                }}
              >
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
                        <Chip key={selected} label={selected} color={(colors as any)[selected]}/>
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
              </Paper>
            </Grid>
          </Grid>

          <Stack
            sx={{ pt: 3 }}
            direction="row"
            spacing={2}
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
          >
            <Button disabled={!selectedLogFile} sx={{width: 400}} variant="contained" onClick={handleUploadFile}>Upload File</Button>

          </Stack>
      </Container>

      <Container sx={{ py: 3, minWidth: '75%' }}>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
        >
          Project Files
        </Typography>
        <Grid container spacing={4} columns={18} sx={{pt:2}}>
          {fList.map(({File, Tag}) => (
              <Grid item key={File.id} xs={3}>
                <PFile
                  key={File.id}
                  name={File.name}
                  extension={File.extension}
                  path={File.path}
                  tag={Tag.value}
                  uploadDate={File.created_at}
                  uuid={File.id}
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
      {snackMessage && <PixSnackBar
          message={snackMessage}
          severityLevel={snackColor}
          onSnackbarClose={onSnackbarClose}
      />}
    </Box>
  )
}

export default ProjectPage