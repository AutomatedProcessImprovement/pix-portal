import { Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import DistributionMappingWithAdd from "../batching/DistributionMappingWithAdd";
import { AllowedDistrParamsName } from "../batching/DistributionSection";
import { JsonData } from "../formData";
import { useSharedStyles } from "../sharedHooks/useSharedStyles";
import AddButtonBase from "../toolbar/AddButtonBase";

interface DiscreteValueOptionsProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
    itemIndex: number
    referencedValuesByCaseAttr: Set<string>
}

const DiscreteValueOptions = (props: DiscreteValueOptionsProps) => {
    const { formState: { control: formControl, getValues }, setErrorMessage, itemIndex, referencedValuesByCaseAttr } = props
    const [isRowAdded, setIsRowAdded] = useState(false)
    const classes = useSharedStyles()
    const objectFieldNamePart = `case_attributes.${itemIndex}.values` as AllowedDistrParamsName

    const { fields, append, remove } = useFieldArray({
        control: formControl,
        name: objectFieldNamePart
    });

    const onOptionAdd = () => {
        setIsRowAdded(true)
        append({
            key: "Option's Name",
            value: 0.5
        })
    };

    const onOptionDelete = (optionValueIndex: number) => {
        const optionName = getValues(`case_attributes.${itemIndex}.values.${optionValueIndex}.key`)

        const isReferencedInPrioritisationRules = referencedValuesByCaseAttr.has(optionName)
        if (isReferencedInPrioritisationRules) {
            setErrorMessage(
                "This value is referenced in one or many prioritisation rules. Remove those rules first"
            )
        }
        else {
            remove(optionValueIndex)
        }
    }

    return (
        <Grid item container xs={12}>
            <Grid item container xs={12}>
                <Grid item xs={10}>
                    <Typography variant="subtitle2" align="left"> Option List </Typography>
                </Grid>
                <Grid item xs={2} className={classes.centeredGrid}>
                    <AddButtonBase
                        labelName="new option"
                        onClick={onOptionAdd}
                        tooltipText="Add new option"
                    />
                </Grid>
            </Grid>
            <DistributionMappingWithAdd
                formState={props.formState}
                objectFieldNamePart={objectFieldNamePart}
                valueLabel="Probability"
                isRowAdded={isRowAdded}
                setIsRowAdded={setIsRowAdded}
                fields={fields}
                remove={onOptionDelete}
                keyTextFieldProps={{
                    label: "Value",
                    type: "text"
                }}
            />
        </Grid>
    )
}

export default DiscreteValueOptions;
