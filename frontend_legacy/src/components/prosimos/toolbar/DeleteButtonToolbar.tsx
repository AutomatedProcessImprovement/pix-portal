import DeleteIcon from '@mui/icons-material/Delete';
import ButtonToolbarBase from "./ButtonToolbarBase";

interface DeleteButtonToolbarProps {
    onClick: () => void
    labelName: string
    tooltipText?: string
}

const DeleteButtonToolbar = (props: DeleteButtonToolbarProps) => {
    return (
        <ButtonToolbarBase
            onClick={props.onClick}
            labelName={props.labelName}
            startIcon={<DeleteIcon />}
            variant="text"
            tooltipText={props.tooltipText}
        />
    )
}

export default DeleteButtonToolbar;