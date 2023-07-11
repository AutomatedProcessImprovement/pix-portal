import { TextField, MenuItem } from "@mui/material";
import { UseFormReturn, Controller, FieldError } from "react-hook-form";
import { JsonData } from "../formData";
import { REQUIRED_ERROR_MSG, RESOURCE_ALLOCATION_DUPLICATES_MSG } from "../validationMessages";

interface ResourceSelectProps {
    formState: UseFormReturn<JsonData, object>
    allocationIndex: number
    resourceIndex: number
    allowedResources: { [key: string]: { name: string } }
    currentError?: FieldError
}

const ResourceSelect = (props: ResourceSelectProps) => {
    const { 
        formState: { control: formControl, getValues },
        allocationIndex, resourceIndex, allowedResources, currentError
    } = props

    const areResourcesUnique = () => {
        const values = 
            getValues(`task_resource_distribution.${allocationIndex}.resources`)
            .map((item) => (item.resource_id))

        const uniqueValues = new Set(values)
        return values.length === uniqueValues.size
    }

    return (
        <Controller
            name={`task_resource_distribution.${allocationIndex}.resources.${resourceIndex}.resource_id`}
            control={formControl}
            rules={{ 
                required: REQUIRED_ERROR_MSG,
                validate: () => { return areResourcesUnique() || RESOURCE_ALLOCATION_DUPLICATES_MSG }
            }}
            render={({ field }) => (
                <TextField 
                    sx={{ width: "100%" }}
                    {...field}
                    label="Resource Profile"
                    variant="standard"
                    select
                    error={currentError !== undefined}
                    helperText={currentError?.message}
                >
                    {Object.entries(allowedResources).map(([resourceId, resourceValue]) => (
                        <MenuItem
                            key={`menuitem_${resourceId}`}
                            value={resourceId}
                        >{resourceValue.name}</MenuItem>
                    ))}
                </TextField>
            )}
        />
    )
}

export default ResourceSelect;