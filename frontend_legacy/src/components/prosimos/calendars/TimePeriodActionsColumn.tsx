import { Grid, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add'

interface TimePeriodActionsColumnProps {
    isOnlyOneRow: boolean
    isLastRow: boolean
    index: number
    tpIndex: number
    onTimePeriodDelete: (index: number, tpIndex: number) => void
    onTimePeriodAdd: () => void
}

const TimePeriodActionsColumn = (props: TimePeriodActionsColumnProps) => {
    const { isOnlyOneRow, 
        isLastRow, 
        index,
        tpIndex,
        onTimePeriodDelete,
        onTimePeriodAdd } = props
    
    return (
        <Grid container alignItems="center" justifyContent="center">
            <Grid item xs={6} >
                {(isOnlyOneRow) ? 
                    (<IconButton
                            size="small"
                            disabled={isOnlyOneRow}
                        >
                            <DeleteIcon />
                        </IconButton>) :
                    (<Tooltip title="Remove time period from the calendar">
                        <IconButton
                            size="small"
                            disabled={isOnlyOneRow}
                            onClick={() => onTimePeriodDelete(index, tpIndex)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>)}
            </Grid>
            <Grid item xs={6}>
                {isLastRow && <Tooltip title="Add time period to the calendar">
                    <IconButton
                        size="small"
                        onClick={onTimePeriodAdd}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>}
            </Grid>
        </Grid>
    )
}

export default TimePeriodActionsColumn;