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
import {v4 as uuidv4} from 'uuid'
import CreateProjectDialog from "../Upload/CreateProjectDialog";
import PixSnackBar from "../PIXSnackBar/PixSnackBar";
import {useEffect, useState} from "react";
import  moment from "moment";
import {createNewProject, editExistingProjectTitle, getProjects, removeProject} from "../../api/api";
import {getUserObjectFromStorage} from "../../../authConfig";
import ConfirmDialog from "../CustomComponents/ConfirmDialog";


const Projects = ({auth, userManager}) => {
  const [userId, setUserId] = React.useState<string | null>(null)

  const _collectProjects = (uuid) => {
      const _projects = getProjects(uuid).then((result:any) => {
        const jsonProjects = result.data.projects
        console.log(jsonProjects)
        setPlist(jsonProjects)
      }).catch((e)=> {
        console.log(e)
      })

  }

  useEffect(() => {
    getUserObjectFromStorage(userManager).then((user)=> {
      setUserId(user.profile.sub)
      _collectProjects(user.profile.sub)
    })
  }, [auth, userManager])

  const [pList, setPlist] = React.useState([])
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createDialogTitle, setCreateDialogTitle] = useState("")
  const [createDialogMessage, setCreateDialogMessage] = useState("")
  const [type, setType] = useState("")
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackMessage, setSnackMessage] = useState("")
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)

  const [pid, setPid] = useState(null)

  const handleClickOpenCreate = () => {
    setType("ADD")
    setCreateDialogMessage("Enter a name for the project")
    setCreateDialogTitle("Create new project")
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setType("")
    setCreateDialogTitle("")
    setCreateDialogMessage("")
  };

  const deleteProject = (pid) => {
    removeProject(pid).then((res) => {
      _collectProjects(userId)
      setSuccessMessage(res.data.message)
    }).catch((e) => {
      setSuccessMessage(e.data.message)
    })
  }

  const handleCloseDeleteDialog = (e) => {
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

  const handleSubmit = (type, e) => {
    if (type === 'ADD') {
      handleAdd(e)
    }
    if (type === 'EDIT') {
      handleEdit(e)
    }
  }

  const handleEdit = (e: string) => {
    console.log(e)
    const _ = editExistingProjectTitle(userId, pid, e).then((_e:any) => {
      setSuccessMessage(_e.data.message)
      // Poll the server again to receive the updated list of projects
      _collectProjects(userId)
      handleCloseCreateDialog()
    });
  }

  const handleAdd = (e: string) => {
    console.log(e)
    const _ = createNewProject(userId, e).then((_e:any) => {
      setSuccessMessage(_e.data.message)
      // Poll the server again to receive the updated list of projects
      _collectProjects(userId)
      handleCloseCreateDialog()
    });
  }

  const handleOpenEditDialog = (pid) => {
    console.log(pid)
    setPid(pid)
    setType("EDIT")
    setCreateDialogMessage("Enter a new name for the project")
    setCreateDialogTitle("Edit existing project")
    setOpenCreateDialog(true);
  }

  const handleRemove = (pid) => {
    console.log(pid)
    setOpenDeleteDialog(true)
    setPid(pid)
  }

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
                onDelete={handleRemove}
                onEdit={handleOpenEditDialog}
              />
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