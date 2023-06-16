import {Card, CardActionArea, CardContent, Grid, Typography} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import {useNavigate} from 'react-router-dom';
import paths from "../../router/paths";

interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userName: string
}

const Project = (props: ProjectProps) => {

  const navigate = useNavigate();

  const handleClick = () => {
    console.log(props)
    navigate(
      paths.PROJECT_ID_PATH, {
        state: {
          pInfo: props
        }
      }
    )
  }

  return (
    <Grid item key={props.uuid} xs={3}>
      <Card
        sx={{ height: '100%'}}
      >
        <CardActionArea onClick={handleClick}>
          <CardContent sx={{ flexGrow: 1, mb: 3 }}>
            <FolderIcon sx={{ fontSize: '40px'}}/>
            <Typography gutterBottom variant="h5" component="h2">
              {props.projectName}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {props.projectCreationDate} - {props.userName}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default Project