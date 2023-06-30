import {
  Card,
  CardActions,
  CardContent, Checkbox,
  Chip, IconButton, ThemeProvider,
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
import {theme} from "../../themes/ChipTheme";

// TODO MOVE THIS AND ALSO IMPLEMENT?
const onClickChip = (e) => {
  console.log(e.target)
  console.log("CHIP clicked")
}

enum TagType {
  "BPMN" = {icon: <DescriptionIcon/>, chip: <Chip label={"BPMN"} color="bpmn" key={'bpmn'} onClick={onClickChip} />},
  "SIM_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"SIM MODEL"} color="sim_model" key={'sim_model'} onClick={onClickChip} />},
  "CONS_MODEL" = {icon: <FindInPageIcon/>, chip: <Chip label={"CONS MODEL"} color="cons_model" key={'cons_model'} onClick={onClickChip} />},
  "EVENT_LOG" = {icon: <GroupIcon/>, chip: <Chip label={"EVENT LOG"} color="event_log" key={'event_log'} onClick={onClickChip} />},
  "UNTAGGED" = {icon: <FolderIcon/>, chip: <Chip label={"UNTAGGED"} color={"untagged"} key={'untagged'} onClick={onClickChip} />},
}

interface FileProps {
  uuid: number
  name: string
  path: string,
  tag: string[],
  uploadDate: string
  onRemove: (id: number) => void
  onChange: (id: number) => boolean
  onDownload: (id: number) => void,
  onEdit: (id: number) => void

}




const PFile = (props: FileProps) => {
  // TODO ability to change TagChip of file?

  const {tag, onDownload, onRemove, onChange, onEdit } = props
  const [checked, setChecked] = React.useState(false)


  const onClickChange = (e) => {
    if (e.target.checked) {
      return onChange(true, props.uuid, props.tag);
    } else {
      return onChange(false, props.uuid, props.tag);
    }
  }

  const onClickDownload = () => {
    onDownload(props.uuid)
  }

  const onClickEdit = () => {
    onEdit(props.uuid, props.name)
  }

  const onClickRemove = () => {
    onRemove(props.uuid)
  }

  return (
      <Card
        sx={{ height: '100%'}}
      >
        <CardContent sx={{ flexGrow: 1, mb: 3 }}>
          {TagType.BPMN["icon"]}
          <Typography variant="h5" component="h2" noWrap>
            {props.name}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary" noWrap>
            {props.uploadDate}
          </Typography>
            <ThemeProvider theme={theme}>
              {tag.map((value => (
                  TagType[value].chip
                )))}
            </ThemeProvider>
        </CardContent>
        <CardActions >
            <IconButton sx={{ flexGrow: 0 }} aria-label="delete file" onClick={onClickRemove}>
              <DeleteIcon />
            </IconButton>
            <IconButton sx={{ flexGrow: 0 }} aria-label="download-file" onClick={onClickDownload}>
              <DownloadIcon />
            </IconButton>
          <IconButton aria-label="edit-profile-name" onClick={onClickEdit}>
            <EditIcon />
          </IconButton>
          <Checkbox checked={checked} sx={{ ml: 'auto' }} onChange={(e)=> {setChecked(onClickChange(e))}}/>
        </CardActions>
      </Card>
  )
}

export default PFile