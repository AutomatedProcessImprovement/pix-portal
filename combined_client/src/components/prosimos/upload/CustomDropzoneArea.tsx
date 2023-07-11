import {useTheme} from "@mui/material";

const useStyles = useTheme({
  root: {
    color: "gray"
  }
});

interface CustomDropzoneAreaProps {
  acceptedFiles: string[];
  setSelectedBpmnFile: (file: any) => void;
  setErrorMessage: (message: string) => void;
}

const CustomDropzoneArea = (props: CustomDropzoneAreaProps) => {
  const classes = useStyles();
  const { acceptedFiles, setErrorMessage, setSelectedBpmnFile } = props
  // const onAlert = (message: string, variant: AlertType) => {
  //   if (variant === "error") {
  //     setErrorMessage(message)
  //   }
  // };

  const onChange = (files: File[]) => {
    // only one file is allowed
    const file = files[0]
    setSelectedBpmnFile(file)
  };

  const onDelete = (_file: File) => {
    setSelectedBpmnFile("")
  };
  return (
    <></>
    // <DropzoneArea
    //   classes={{
    //     root: classes.root
    //   }}
    //   // Icon={<FileUploadIcon />}
    //   acceptedFiles={acceptedFiles}
    //   filesLimit={1}
    //   showPreviews={true}
    //   previewText={"Uploaded file:"}
    //   showPreviewsInDropzone={false}
    //   showFileNamesInPreview={true}
    //   showFileNames={true}
    //   useChipsForPreview={true}
    //   showAlerts={false}
    //   clearOnUnmount={true}
    //   disableRejectionFeedback={true}
    //   onDelete={onDelete}
    //   onChange={onChange}
    //   onAlert={onAlert}
    // />
  )
}

export default CustomDropzoneArea;
