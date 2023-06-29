import {Card, CardActionArea, CardActions, CardContent, Grid, IconButton, Typography} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import {useNavigate} from 'react-router-dom';
import paths from "../../router/paths";
import * as React from "react";
import DeleteIcon from '@mui/icons-material/Delete';

interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userId: string,
  onDelete: (pid) => void
}

const Project = (props: ProjectProps) => {

  const {uuid, projectName, projectCreationDate, userId, onDelete} = props

  const navigate = useNavigate();

  const handleClick = () => {
    console.log(props)
    navigate(
      paths.PROJECT_ID_PATH, {
        state: {
          pInfo: {uuid, projectName, projectCreationDate, userId}
        }
      }
    )
  }

  const onClickDelete = () => {
    console.log(props.uuid)
    onDelete(props.uuid)
  }


  // TODO click to remove project

  return (
    <Grid item key={props.uuid} xs={3}>
      <Card>
        <CardActionArea onClick={handleClick}>
          <CardContent sx={{ flexGrow: 1, pb:0, mb:0 }}>
            <FolderIcon sx={{ fontSize: '40px'}}/>
            <Typography gutterBottom variant="h5" component="h2">
              {props.projectName}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Created: {props.projectCreationDate}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions >
          <IconButton aria-label="delete file" onClick={onClickDelete}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  )
}

export default Project