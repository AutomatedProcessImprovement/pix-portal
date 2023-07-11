import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import TimeDistribution from "../distributions/TimeDistribution";
import { JsonData } from "../formData";
import ResourceSelect from "./ResourceSelect";
import DeleteIcon from '@mui/icons-material/Delete';

interface ResourceDistributionProps {
    formState: UseFormReturn<JsonData, object>
    allocationIndex: number
    resourceIndex: number
    allowedResources: { [key: string]: { name: string } }
    setErrorMessage: (value: string) => void
    onResourceAllocationDelete: (index: number) => void
}

const ResourceDistribution = (props: ResourceDistributionProps) => {
    const { formState, allocationIndex, resourceIndex, allowedResources, setErrorMessage, onResourceAllocationDelete } = props
    const { formState: { errors } } = formState
    
    const currentErrors = errors?.task_resource_distribution?.[allocationIndex]?.resources?.[resourceIndex]
    const distrErrors = {
        distribution_name: currentErrors?.distribution_name,
        distribution_params: currentErrors?.distribution_params
    }

    const onDelete = () => {
        onResourceAllocationDelete(resourceIndex)
    }

    return (
        <Paper elevation={5} sx={{ pr: 3, pl: 3, minHeight: "230px" }}>
            <Grid container spacing={2}>
                <Grid item xs={11}>
                    <ResourceSelect
                        formState={formState}
                        allocationIndex={allocationIndex}
                        resourceIndex={resourceIndex}
                        allowedResources={allowedResources}
                        currentError={currentErrors?.resource_id}
                    />
                </Grid>
                <Grid item xs={1}>
                    <IconButton component="span" onClick={onDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" align="left">
                        Duration
                    </Typography>
                    <TimeDistribution
                        formState={formState}
                        objectNamePath={`task_resource_distribution.${allocationIndex}.resources.${resourceIndex}`}
                        errors={distrErrors}
                        setErrorMessage={setErrorMessage}
                    />
                </Grid>
            </Grid>
        </Paper>
    )
}

export default ResourceDistribution;
