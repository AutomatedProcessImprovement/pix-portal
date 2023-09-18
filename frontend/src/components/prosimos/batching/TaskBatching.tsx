import { Grid, Typography } from "@mui/material";
import { UseFormReturn, Controller } from "react-hook-form";
import { JsonData } from "../formData";
import BatchingProbability from "./BatchingProbability";
import BatchingTypeSelect from "./BatchingTypeSelect";
import DistributionSection from "./DistributionSection";
import { QueryBuilder } from "./QueryBuilder";

interface TaskBatchingProps {
    style: any
    formState: UseFormReturn<JsonData, object>
    taskIndex: number
}

/**
 * Component for rendering all task's details in regards to batching
 */
const TaskBatching = (props: TaskBatchingProps) => {
    const { formState: { control: formControl }, taskIndex, style } = props

    return (
        <Grid container item
            style={{
                ...style,
                overflow: "scroll"
            }}
        >
            <Grid item xs={12}>
                <Controller
                    name={`batch_processing.${taskIndex}.type`}
                    control={formControl}
                    render={({ field }) => (
                        <BatchingTypeSelect
                            field={field}
                            label={"Batching Type"}
                            // TODO: errors
                            // fieldError={currErrors?.from}
                        />
                    )}
                />
            </Grid>
            <Grid container item xs={12} sx={{ mt: 2 }} spacing={2}>
                <BatchingProbability
                    formState={props.formState}
                    taskIndex={taskIndex}
                />
                <DistributionSection
                    sectionLabel="Duration Scaling"
                    formState={props.formState}
                    taskIndex={taskIndex}
                    objectFieldNamePart={`batch_processing.${taskIndex}.duration_distrib`}
                    valueLabel="Scale Factor"
                />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" align="left"> Firing Rules </Typography>
                <QueryBuilder
                    formState={props.formState}
                    name={`batch_processing.${taskIndex}.firing_rules`}
                />
            </Grid>
        </Grid>
    )
}

export default TaskBatching;
