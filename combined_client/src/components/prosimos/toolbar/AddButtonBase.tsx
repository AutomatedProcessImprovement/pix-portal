import ButtonToolbarBase from "./ButtonToolbarBase";
import AddIcon from '@mui/icons-material/Add';

interface AddButtonBaseProps {
    onClick: () => void
    labelName: string
    tooltipText?: string
}

const AddButtonBase = (props: AddButtonBaseProps) => {
    return (
        <ButtonToolbarBase
            onClick={props.onClick}
            labelName={props.labelName}
            startIcon={<AddIcon />}
            variant="text"
            tooltipText={props.tooltipText}
        />
    )
}

export default AddButtonBase;
