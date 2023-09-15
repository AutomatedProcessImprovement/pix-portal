import { Grid, Typography } from "@mui/material";

interface NoItemsCardProps {
    noItemsTitle: string
}

const NoItemsCard = (props: NoItemsCardProps) => {
    const { noItemsTitle } = props

    return (
        <Grid item xs={12} sx={{ mt: 5 }}>
            <Typography variant="h6" align="center">
                {noItemsTitle}
            </Typography>
        </Grid>
    )
}

export default NoItemsCard;