import { useRef, useState } from 'react';
import { Grid, Input, Button } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useEffect } from 'react';

interface FileUploaderProps {
    file: File | null
    startId: string
    ext?: string
    onFileChange: (file: any) => void
    sizeLimitInMb?: number
    setErrorMessage: (value: string) => void
}

const FileUploader = (props: FileUploaderProps) => {
    const {file, sizeLimitInMb, setErrorMessage} = props
    const [selectedFile, setSelectedFile] = useState<File | null>(file)
    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (props.file !== selectedFile) {
            setSelectedFile(props.file)
            if (props.file === null && inputRef.current) {
                inputRef.current.value = ""
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.file]);

    const onFileChange = (event: any) => {
        const selectedFile = event.target.files[0]
        if (selectedFile) {
            const fileSizeInMb = selectedFile.size / 1000000
            if (sizeLimitInMb && fileSizeInMb > sizeLimitInMb) {
                setErrorMessage(`File exceeds the size limit of ${sizeLimitInMb} MB`)
    
                /// nullify so that selecting the same file one more time will trigger onFileChange
                if (inputRef.current) {
                    inputRef.current.value = ""
                }
    
                return
            }

            setSelectedFile(selectedFile)
            props.onFileChange(selectedFile)
        }
    };
    
    return (<Grid container alignItems="center" justifyContent="center">
        <Grid item xs={12} className="centeredContent">
            <label htmlFor={props.startId}>
                <Input
                    inputRef={inputRef}
                    type="file"
                    inputProps={props.ext !== undefined ? { accept: props.ext } : {}}
                    style={{ display: 'none' }}
                    id={props.startId}
                    onChange={onFileChange}
                />
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}>
                    Choose File
                </Button>
            </label>
        </Grid>
        {
            (selectedFile !== null && selectedFile !== undefined) && (
                <Grid item xs={12} className="centeredContent">
                    <p>Uploaded file: {selectedFile && selectedFile.name}</p>
                </Grid>
            )
        }
    </Grid>)
}

export default FileUploader;