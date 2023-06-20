import {Card, CardActionArea, CardContent, Chip, Grid, Typography} from "@mui/material";
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

enum TagType {
  "BPMN" = {icon: <DescriptionIcon/>, chip: <Chip label={"BPMN"} color="primary"/>},
  "SIM_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"SIM MODEL"} color="secondary"/>},
  "EVENT_LOG" = {icon: <GroupIcon/>, chip: <Chip label={"EVENT LOG"} color="success"/>},
  "UNTAGGED" = {icon: <FolderIcon/>, chip: <Chip label={"UNTAGGED"} color={"error"}/>},
}

interface FileProps {
  uuid: number
  name: string
  path: string,
  tag: string[],
  uploadDate: string

}

const File = (props: FileProps) => {
  console.log(props)

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
            {types.map((value => (
                TagType[value].chip
              )))}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default File