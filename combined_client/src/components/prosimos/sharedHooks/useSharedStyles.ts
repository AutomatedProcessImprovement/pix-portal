import { makeStyles } from 'tss-react/mui';

const useSharedStyles = makeStyles()(() => ({
    centeredGrid: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}));

export { useSharedStyles };