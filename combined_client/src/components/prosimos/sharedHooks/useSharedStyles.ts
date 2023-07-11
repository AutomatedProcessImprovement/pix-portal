import {Theme} from "@mui/material";
import { makeStyles } from 'tss-react/mui';

const useSharedStyles = makeStyles()((theme: Theme) => ({
    centeredGrid: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}));

export { useSharedStyles };