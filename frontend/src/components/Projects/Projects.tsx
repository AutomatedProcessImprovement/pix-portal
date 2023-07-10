import {
  AlertColor,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import Project from "./Project";
import * as React from "react";
import CreateProjectDialog from "../Upload/CreateProjectDialog";
import PixSnackBar from "../PIXSnackBar/PixSnackBar";
import {useEffect, useState} from "react";
import  moment from "moment";
import ConfirmDialog from "../CustomComponents/ConfirmDialog";
import {createNewProject, editExistingProjectTitle, getProjects, removeProject} from "../../api/project_api";
import paths from "../../router/paths";
import {useNavigate} from 'react-router-dom';



const Projects = ({auth, userManager}:any) => {
  const [pid, setPid] = useState<string | null>(null)
  const [pList, setPlist] = React.useState([])

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [createDialogTitle, setCreateDialogTitle] = useState("")
  const [createDialogMessage, setCreateDialogMessage] = useState("")
  const [type, setType] = useState("")

  const [snackMessage, setSnackMessage] = useState("")
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)

  const navigate = useNavigate();


  useEffect(() => {
    userManager.getUser().then((res:any)=> {
      _collectProjects();
    })
  }, [auth, userManager])


  const _collectProjects = () => {
      getProjects().then((result:any) => {
        const jsonProjects = result.data.projects
        setPlist(jsonProjects)
      }).catch((e)=> {
        console.log(e)
      })
  }
  
  const handleNavigateSpecificProject = (projectProps:any) => {
    navigate(
      paths.PROJECT_ID_PATH, {
        state: {
          pid: projectProps.uuid,
          projectName: projectProps.projectName,
          projectCreationDate: projectProps.projectCreationDate,
          uuid: projectProps.userId
        }
      }
    )
  }

  const handleSubmit = (type:any, e:any) => {
    if (type === 'ADD') {
      handleAdd(e)
    }
    if (type === 'EDIT') {
      handleEdit(e)
    }
  }

  const handleEdit = (e: string) => {
    if (pid != null) {
      editExistingProjectTitle(pid, e).then((_e:any) => {
        setSuccessMessage(_e.data.message)
        _collectProjects()
        handleCloseCreateDialog()
      });
    }
  }

  const handleAdd = (e: string) => {
    createNewProject(e).then((_e:any) => {
      setSuccessMessage(_e.data.message)
      _collectProjects()
      handleCloseCreateDialog()
    });
  }

  const deleteProject = (pid:any) => {
    removeProject(pid).then((res) => {
      _collectProjects()
      setSuccessMessage(res.data.message)
    }).catch((e) => {
      setSuccessMessage(e.data.message)
    })
  }

  const handleOpenDeleteDialog = (pid:any) => {
    setOpenDeleteDialog(true)
    setPid(pid)
  }

  const handleClickOpenCreate = () => {
    setType("ADD")
    setCreateDialogMessage("Enter a name for the project")
    setCreateDialogTitle("Create new project")
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (pid:any) => {
    setPid(pid)
    setType("EDIT")
    setCreateDialogMessage("Enter a new name for the project")
    setCreateDialogTitle("Edit existing project")
    setOpenCreateDialog(true);
  }

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setType("")
    setCreateDialogTitle("")
    setCreateDialogMessage("")
  };

  const handleCloseDeleteDialog = (e:any) => {
    if (e && pid) {
      deleteProject(pid)
    }
    setPid(null);
    setOpenDeleteDialog(false);
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

  const onSnackbarClose = () => {
    setSuccessMessage("")
    setInfoMessage("")
    setErrorMessage("")
  };

  return (
    <>
      <Box
        sx={{
          pt: 4,
          pb: 4,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            My projects
          </Typography>
          <Stack
            sx={{ pt: 1 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Button variant="contained" onClick={handleClickOpenCreate}>Create new project</Button>
          </Stack>
        </Container>
      </Box>
      <Container sx={{ py: 5, minWidth: '65%' }}>
        <Grid container spacing={4}>
          {pList.length === 0 ?
            <Grid item xs={12}>
              <Typography
                component="h4"
                variant="h5"
                align="center"
                color="text.primary"
                gutterBottom
              >
                It's quite empty here...
              </Typography>
            </Grid>
              :
            pList.map(({id, name, user_id, createdOn}) => (
              <Project
                key={id}
                projectCreationDate={moment(createdOn).format('DD/MM/YYYY')}
                projectName={name}
                userId={user_id}
                uuid={id}
                onDelete={handleOpenDeleteDialog}
                onEdit={handleOpenEditDialog}
               onSelect={handleNavigateSpecificProject}/>
            ))
          }
        </Grid>
      </Container>

      < CreateProjectDialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        onSubmit={handleSubmit}
        message={createDialogMessage}
        title={createDialogTitle}
        type={type}
        value={""}/>
      <ConfirmDialog
        message={"Are you sure you want to delete this project?"}
        onClose={handleCloseDeleteDialog}
        open={openDeleteDialog}
        title={"Delete file?"}/>
      {snackMessage && <PixSnackBar
          message={snackMessage}
          severityLevel={snackColor}
          onSnackbarClose={onSnackbarClose}
      />}
    </>
  )
}

export default Projects;