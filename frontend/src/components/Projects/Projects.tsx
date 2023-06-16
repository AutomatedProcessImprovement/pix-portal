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
import {useState} from "react";

const temp_projects= [
]

const Projects = () => {

  const [pList, setPlist] = React.useState(temp_projects)

  const [open, setOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("")
  const [snackColor, setSnackColor] = useState<AlertColor | undefined>(undefined)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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


  const handleAdd = (e: string) => {
    console.log(e)
    // TODO ASYNC ADD NEW PROJECT
    setSuccessMessage("New project created")
    const newProject = {uuid: uuidv4(), projectCreationDate: new Date().toLocaleDateString(), projectName: e, userName: "You?"}
    setPlist(pList.concat(newProject))
    handleClose()
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
            <Button variant="contained" onClick={handleClickOpen}>Create new project</Button>
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
            pList.map(({uuid, projectName, userName, projectCreationDate}) => (
              <Project
                key={uuid}
                projectCreationDate={projectCreationDate}
                projectName={projectName}
                userName={userName}
                uuid={uuid}
              />
            ))
          }
        </Grid>
      </Container>

      < CreateProjectDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleAdd}
      />
      {snackMessage && <PixSnackBar
          message={snackMessage}
          severityLevel={snackColor}
          onSnackbarClose={onSnackbarClose}
      />}
    </>
  )
}

export default Projects;