import {Card, CardActionArea, CardActions, CardContent, Grid, IconButton, Typography} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface ProjectProps {
  uuid: number
  projectName: string,
  projectCreationDate: string,
  userId: string,
  onDelete: (pid:any) => void,
  onEdit: (pid:any) => void,
  onSelect: (props:any) => void
}



const Project = (props: ProjectProps) => {
  const {uuid, projectName, projectCreationDate, userId, onDelete, onEdit, onSelect} = props


  const handleClick = () => {
    onSelect({userId,projectName, projectCreationDate, uuid})
  }

  const onClickDelete = () => {
    console.log(props.uuid)
    onDelete(props.uuid)
  }

  const onClickEdit = () => {
    console.log(props.uuid)
    onEdit(props.uuid)
  }

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
        <CardActions sx={{ justifyContent: 'space-between' }} >
          <IconButton aria-label="delete-project" onClick={onClickDelete}>
            <DeleteIcon />
          </IconButton>
          <IconButton aria-label="edit-profile-name" onClick={onClickEdit}>
            <EditIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  )
}

export default Project