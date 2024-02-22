import { DropzoneArea } from "mui-file-dropzone"

interface DropzoneAreaProps {
    acceptedFiles: string[]
    setSelectedFiles: (files: any) => void
    filesLimit: number
}

const FileDropzoneArea = (props: DropzoneAreaProps) => {
    const { acceptedFiles, setSelectedFiles } = props

    const onChange = (_files: File[]) => {
        if (_files.length === 1 && _files[0].name.endsWith(".zip")) {
            setSelectedFiles(_files[0])
        } else {
            setSelectedFiles(_files)
        }
    }
    const onDelete = (_files: File) => {
        setSelectedFiles(undefined)
    }

    return (
        <DropzoneArea
            onChange={onChange}
            onDelete={onDelete}
            filesLimit={props.filesLimit}
            showFileNames={true}
            maxFileSize={500000000}
            showPreviews={true}
            previewText={"Uploaded files:"}
            showPreviewsInDropzone={false}
            showFileNamesInPreview={true}
            useChipsForPreview={true}
            showAlerts={false}
            clearOnUnmount={true}
            disableRejectionFeedback={true}
            acceptedFiles={acceptedFiles}
            fileObjects={setSelectedFiles}
        />
    )
}

export default FileDropzoneArea
