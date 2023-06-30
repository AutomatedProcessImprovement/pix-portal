import { Dropzone, FileMosaic } from "@files-ui/react";
import * as React from "react";
import {ProjectFile} from "../../types/types";

interface CustomDropzoneAreaProps {
  acceptedFiles: string[];
  setSelectedLogFile: (file:any) => void;
  extFiles: any
  setExtFiles: (file:any) => void
}

const DropZoneArea = (props: CustomDropzoneAreaProps) => {
  const { acceptedFiles, setSelectedLogFile} = props
  const [extFiles, setExtFiles] = [props.extFiles, props.setExtFiles]

  const updateFiles = (incomingFiles) => {
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