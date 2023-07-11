import { Toolbar } from "@mui/material"
import AddButtonToolbar from "../toolbar/AddButtonToolbar";

type AllPrioritisationItemsToolbarProps = {
    onAddNew: () => void,
}

const AllPrioritisationItemsToolbar = ({ onAddNew }: AllPrioritisationItemsToolbarProps) => {
    return (
        <Toolbar sx={{ justifyContent: "flex-end", marginLeft: "auto" }}>
            <AddButtonToolbar
                onClick={onAddNew}
                labelName="new prioritisation rule"
            />
        </Toolbar>
    )
};

export default AllPrioritisationItemsToolbar;
