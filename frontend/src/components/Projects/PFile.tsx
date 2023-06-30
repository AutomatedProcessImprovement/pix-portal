import {
  Card,
  CardActions,
  CardContent, Checkbox,
  Chip,
  createTheme,
  Grid, IconButton, ThemeProvider,
  Typography
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from "react";
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    bpmn: {
      main: '#ffc107',
      contrastText: '#fff',
    },
    event_log: {
      main: '#009688',
      contrastText: '#fff',
    },
    sim_model: {
      main: '#2196f3',
      contrastText: '#fff',
    },
    cons_model: {
      main: '#7e57c2',
      contrastText: '#fff',
    },
    untagged: {
      main: '#ef5350',
      contrastText: '#fff',
    },
  },
});


enum TagType {
  "BPMN" = {icon: <DescriptionIcon/>, chip: <Chip label={"BPMN"} color="bpmn" key={'bpmn'}/>},
  "SIM_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"SIM MODEL"} color="sim_model" key={'sim_model'}/>},
  "CONS_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"CONS MODEL"} color="cons_model" key={'cons_model'}/>},
  "EVENT_LOG" = {icon: <GroupIcon/>, chip: <Chip label={"EVENT LOG"} color="event_log" key={'event_log'}/>},
  "UNTAGGED" = {icon: <FolderIcon/>, chip: <Chip label={"UNTAGGED"} color={"untagged"} key={'untagged'}/>},
}

interface FileProps {
  uuid: number
  name: string
  path: string,
  tag: string[],
  uploadDate: string
  onClickRemove: (id: number) => void
  onChange: (id: number) => boolean
  onClickDownload: (id: number) => void,
  onEdit: (id: number) => {}

}

const PFile = (props: FileProps) => {
  // TODO ability to change TagChip of file?
  const [types, setTypes] = React.useState(props.tag)
  const [checked, setChecked] = React.useState(false)
  const onClickRemove = props.onClickRemove
  const onClickChange = props.onChange
  const onClickDownload = props.onClickDownload
  const onEdit = props.onEdit

  const onChange = (e) => {
    if (e.target.checked) {
      return onClickChange(true, props.uuid, props.tag);
    } else {
      return onClickChange(false, props.uuid, props.tag);
    }
  }

  const onDownload = () => {
    onClickDownload(props.uuid)
  }

  const onClickEdit = () => {
    onEdit(props.uuid, props.name)
  }

  const onRemove = () => {
    onClickRemove(props.uuid)
  }

  return (
      <Card
        sx={{ height: '100%'}}
      >
        <CardContent sx={{ flexGrow: 1, mb: 3 }}>
          {TagType.BPMN["icon"]}
          <Typography variant="h5" component="h2" style={{ wordWrap: "break-word" }}>
            {props.name}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary" style={{ wordWrap: "break-word" }}>
            {props.uploadDate}
          </Typography>
            <ThemeProvider theme={theme}>
              {types.map((value => (
                  TagType[value].chip
                )))}
            </ThemeProvider>
        </CardContent>
        <CardActions >
            <IconButton sx={{ flexGrow: 0 }} aria-label="delete file" onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
            <IconButton sx={{ flexGrow: 0 }} aria-label="download-file" onClick={onDownload}>
              <DownloadIcon />
            </IconButton>
          <IconButton aria-label="edit-profile-name" onClick={onClickEdit}>
            <EditIcon />
          </IconButton>
          <Checkbox checked={checked} sx={{ ml: 'auto' }} onChange={(e)=> {setChecked(onChange(e))}}/>
        </CardActions>
      </Card>
  )
}

export default PFile