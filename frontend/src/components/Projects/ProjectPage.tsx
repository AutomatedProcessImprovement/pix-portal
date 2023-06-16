import {Box, Container, Grid, Paper, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";

import {v4 as uuidv4} from 'uuid'
import * as React from "react";
import File from "./File";

interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userName: string
}

const ProjectPage = () => {

  const state = useLocation();
  const { pInfo } = state.state as ProjectProps
  const files = [
    {uuid: uuidv4(), path: "/some/path/model.bpmn", tag: "BPMN", uploadDate: "SOMEDATE", name: "Model"},
    {uuid: uuidv4(), path: "/some/path/simmodel.json", tag: "SIMMODEL", uploadDate: "SOMEDATE", name: "loan_application"},
    {uuid: uuidv4(), path: "/some/path/eventlog.csv", tag: "EVLOG", uploadDate: "SOMEDATE", name: "Load Event Log"},
    {uuid: uuidv4(), path: "/some/path/eventlog.csv", tag: "", uploadDate: "SOMEDATE", name: "FileName"},
  ]

  return (
      <Box
        sx={{
          // bgcolor: 'background.paper',
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

        <Container sx={{ py: 5, minWidth: '65%' }}>
          <Grid container spacing={4}>
            {files.map(({uuid, path, tag, uploadDate, name}) => (
              <File
                key={uuid}
                 name={name}
                 path={path}
                 tag={tag}
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