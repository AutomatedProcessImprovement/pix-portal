import {
  Box,
  Card,
  CardActions,
  CardContent, CardHeader, Checkbox,
  Chip,
  createTheme,
  Grid, IconButton, Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from "react";

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
  "BPMN" = {icon: <DescriptionIcon/>, chip: <Chip label={"BPMN"} color="bpmn"/>},
  "SIM_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"SIM MODEL"} color="sim_model"/>},
  "CONS_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"CONS MODEL"} color="cons_model"/>},
  "EVENT_LOG" = {icon: <GroupIcon/>, chip: <Chip label={"EVENT LOG"} color="event_log"/>},
  "UNTAGGED" = {icon: <FolderIcon/>, chip: <Chip label={"UNTAGGED"} color={"untagged"}/>},
}

interface FileProps {
  uuid: number
  name: string
  path: string,
  tag: string[],
  uploadDate: string
  onClickRemove: (id: number) => void
  onChange: (id: number) => boolean

}

const PFile = (props: FileProps) => {
  const [types, setTypes] = React.useState(props.tag)
  const [checked, setChecked] = React.useState(false)
  const onClickRemove = props.onClickRemove
  const onClickChange = props.onChange

  const onChange = (e) => {
    if (e.target.checked) {
      return onClickChange(true, props.uuid, props.tag);
    } else {
      return onClickChange(false, props.uuid, props.tag);
    }
  }

  const onRemove = () => {
    onClickRemove(props.uuid)
  }

  return (
    <Grid item key={props.uuid} xs={3}>
      <Card
        sx={{ height: '100%'}}
      >
        <CardContent sx={{ flexGrow: 1, mb: 3 }}>
          {TagType.BPMN["icon"]}
          {/**/}
          <Typography variant="h5" component="h2">
            {props.name}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {props.uploadDate}
          </Typography>
            <ThemeProvider theme={theme}>
              {types.map((value => (
                  TagType[value].chip
                )))}
            </ThemeProvider>
        </CardContent>
        <CardActions >
            <IconButton aria-label="delete file" onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
          <Checkbox checked={checked} sx={{ml:'auto'}} onChange={(e)=> {setChecked(onChange(e))}}/>
        </CardActions>
      </Card>
    </Grid>
  )
}

export default PFile