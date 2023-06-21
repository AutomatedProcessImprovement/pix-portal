import { Dropzone, FileMosaic } from "@files-ui/react";
import * as React from "react";
import {ProjectFile} from "../../types/types";
import {Box, Chip, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack} from "@mui/material";


interface CustomDropzoneAreaProps {
  acceptedFiles: string[];
  setSelectedLogFile: (file:any) => void;
}
//
const DropZoneArea = (props: CustomDropzoneAreaProps) => {
  // const classes = useStyles();
  const { acceptedFiles, setSelectedLogFile} = props
  const [extFiles, setExtFiles] = React.useState([]);
  const updateFiles = (incomingFiles) => {
    console.log("incoming files", incomingFiles);

    const projectFile = new ProjectFile()
    projectFile.tags = []
    projectFile.file = incomingFiles[0].file

    setExtFiles(incomingFiles)
    setSelectedLogFile(incomingFiles[0].file);
  };
  const onDelete = (id) => {
    setExtFiles(extFiles.filter((x) => x.id !== id));
    setSelectedLogFile(null);
  };

  const handleStart = (filesToUpload) => {
    console.log("advanced demo start upload", filesToUpload);
  };
  const handleFinish = (uploadedFiles) => {
    console.log("advanced demo finish upload", uploadedFiles);
  };





  const onAlert = () => {
  };



  return (
    <Dropzone
      onChange={updateFiles}
      minHeight="195px"
      value={extFiles}
      accept={acceptedFiles}
      maxFiles={1}
      maxFileSize={50 * 1024*1024}
      label="Drag'n drop files here or click to browse"
    >
      {extFiles.map((file) => (
        <FileMosaic key={file.id} {...file} onDelete={onDelete} info />
      ))}
    </Dropzone>

  )
}

export default DropZoneArea