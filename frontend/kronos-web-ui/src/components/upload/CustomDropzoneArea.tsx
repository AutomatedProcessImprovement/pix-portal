import {DropzoneArea} from "material-ui-dropzone";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: {
        color: "gray"
    }
});

interface CustomDropzoneAreaProps {
    acceptedFiles: string[];
    setSelectedLogFile: (file: any) => void;
}

const CustomDropzoneArea = (props: CustomDropzoneAreaProps) => {
    const classes = useStyles();
    const {acceptedFiles, setSelectedLogFile} = props
    const onAlert = () => {
    };

    const onChange = (files: File[]) => {
        // only one file is allowed
        setSelectedLogFile(files[0])
    };

    const onDelete = (_file: File) => {
        setSelectedLogFile("")
    };
    return (
        <DropzoneArea
            classes={{
                root: classes.root
            }}
            acceptedFiles={acceptedFiles}
            filesLimit={1}
            showPreviews={true}
            previewText={"Uploaded file:"}
            showPreviewsInDropzone={false}
            showFileNamesInPreview={true}
            showFileNames={true}
            useChipsForPreview={true}
            showAlerts={false}
            clearOnUnmount={true}
            disableRejectionFeedback={true}
            onDelete={onDelete}
            onChange={onChange}
            onAlert={onAlert}
            maxFileSize={50000000}
            dropzoneText={"Drag and drop a file here or click to browse files"}

        />
    )
}

export default CustomDropzoneArea;