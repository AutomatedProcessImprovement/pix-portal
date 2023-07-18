import AddIcon from '@mui/icons-material/Add';
import ButtonToolbarBase from "./ButtonToolbarBase";

interface AddButtonToolbarProps {
    onClick: () => void
    labelName: string
    variant?: "text" | "outlined"
    tooltipText?: string
}

const AddButtonToolbar = (props: AddButtonToolbarProps) => {
    return (
        <ButtonToolbarBase
            onClick={props.onClick}
            labelName={props.labelName}
            startIcon={<AddIcon />}
            variant={props.variant || "outlined"}
            tooltipText={props.tooltipText}
        />
    )
}

export default AddButtonToolbar;
