import { Grid, IconButton } from "@mui/material"

interface GridItemWithCenteredIconProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>,
    icon: React.ReactNode
}

const GridItemWithCenteredIcon = (props: GridItemWithCenteredIconProps) => {
    const { onClick, icon } = props

    return (
        <Grid item xs={1} style={{ display: "flex", alignItems: "center" }}>
            <IconButton
                size="small"
                onClick={onClick}
            >
                {icon}
            </IconButton>
        </Grid>
    )
}

export default GridItemWithCenteredIcon;