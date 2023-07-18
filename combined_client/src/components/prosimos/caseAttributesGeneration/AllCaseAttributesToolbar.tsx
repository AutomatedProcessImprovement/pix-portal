import { ButtonGroup } from "@mui/material";
import { Toolbar } from "@mui/material"
import AddButtonToolbar from "../toolbar/AddButtonToolbar";

export type DiscreteOrContinuousString =
    "discrete" | "continuous"

export const DISCRETE_STRING: DiscreteOrContinuousString = "discrete"
export const CONTINUOUS_STRING: DiscreteOrContinuousString = "continuous"

type AllCaseAttributesToolbarProps = {
    onAddNew: (caseAttributeType: DiscreteOrContinuousString) => void
}

const AllCaseAttributesToolbar = ({ onAddNew }: AllCaseAttributesToolbarProps) => {
    const getButtonElement = (type: DiscreteOrContinuousString) => {
        const newItemText = `new ${type} case attribute`

        return (
            <AddButtonToolbar
                onClick={() => onAddNew(type)}
                labelName={newItemText}
                tooltipText={`Add ${newItemText}`}
            />
        )
    }

    return (
        <Toolbar sx={{ justifyContent: "flex-end", marginLeft: "auto" }}>
            <ButtonGroup>
                {[DISCRETE_STRING, CONTINUOUS_STRING].map(getButtonElement)}
            </ButtonGroup>
        </Toolbar>
    )
}

export default AllCaseAttributesToolbar;
