import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  createTheme,
  Grid,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import {useNavigate} from 'react-router-dom';
import paths from "../../router/paths";
import DescriptionIcon from '@mui/icons-material/Description';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import GroupIcon from '@mui/icons-material/Group';
import * as React from "react";

// class TagClass {
//   static readonly BPMN = {icon: <DescriptionIcon/>, chip: <Chip label={"BPMN"} color={"#000000"}/>},
// }

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

}

const PFile = (props: FileProps) => {
  const [types, setTypes] = React.useState(props.tag)
  // console.log(type)

  // const navigate = useNavigate();

  // const handleClick = () => {
  //   console.log(props)
  //   navigate(
  //     paths.PROJECT_ID_PATH, {
  //       state: {
  //         pInfo: props
  //       }
  //     }
  //   )
  // }

  // setIcon(TagType[props.tag])


  return (
    <Grid item key={props.uuid} xs={3}>
      <Card
        sx={{ height: '100%'}}
      >
        <CardActionArea>
          <CardContent sx={{ flexGrow: 1, mb: 3 }}>
            {TagType.BPMN["icon"]}
            <Typography gutterBottom variant="h5" component="h2">
              {props.name}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {props.uploadDate}
            </Typography>
            <Stack direction="row" spacing={1}>
              <ThemeProvider theme={theme}>
                {types.map((value => (
                    TagType[value].chip
                  )))}
              </ThemeProvider>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default PFile