import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import Project from "./Project";


const temp_projects= [
  {uuid: 1, pcd: "12/12/12", pname:"Project 1", uname: "me"},
  {uuid: 2, pcd: "12/13/12", pname:"Project 2", uname: "me"},
  {uuid: 3, pcd: "12/14/12", pname:"Project 3", uname: "me"},
  {uuid: 4, pcd: "12/15/12", pname:"Project 4", uname: "me"},
  {uuid: 5, pcd: "12/16/12", pname:"Project 5", uname: "me"}
]

const Projects = () => {

  return (
    <>
      <Box
        sx={{
          // bgcolor: 'background.paper',
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
            <Button variant="contained">Create new project</Button>
          </Stack>
        </Container>
      </Box>
      <Container sx={{ py: 5, minWidth: '65%' }}>
        <Grid container spacing={4}>
          {temp_projects.map((item) => (
            <Project
             projectCreationDate={item.pcd}
             projectName={item.pname}
             userName={item.uname}
             uuid={item.uuid}
            />
            // <Grid item key={card} xs={3}>
            //   <Card
            //     sx={{ height: '100%'}}
            //   >
            //     <CardActionArea>
            //       <CardContent sx={{ flexGrow: 1, mb: 3 }}>
            //         <FolderIcon sx={{ fontSize: '40px'}}/>
            //         <Typography gutterBottom variant="h5" component="h2">
            //           My Project #
            //         </Typography>
            //         <Typography sx={{ mb: 1.5 }} color="text.secondary">
            //           30 February 3500 - User Name
            //         </Typography>
            //       </CardContent>
            //     </CardActionArea>
            //   </Card>
            // </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}

export default Projects;