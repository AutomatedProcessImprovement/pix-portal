import { Card, Grid, TextField, Typography } from "@mui/material";
import { Controller, UseFormReturn } from "react-hook-form";
import TimeDistribution from "../distributions/TimeDistribution";
import { JsonData } from "../formData";
import { REQUIRED_ERROR_MSG } from "../validationMessages";
import DeleteButtonToolbar from "../toolbar/DeleteButtonToolbar";
import { useSharedStyles } from "../sharedHooks/useSharedStyles";

interface ContinuousCaseAttrProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
    itemIndex: number
    remove: (index: number) => void
}

const ContinuousCaseAttr = (props: ContinuousCaseAttrProps) => {
    const { formState, formState: { control: formControl, formState: { errors } }, setErrorMessage, itemIndex, remove } = props
    const classes = useSharedStyles()

    const onContinuousCaseAttrDelete = () => {
        remove(itemIndex)
    }

    const { case_attributes: caseAttributesErrors } = errors as any
    const currentCaseAttributeErrors = caseAttributesErrors?.[itemIndex]

    return (
        <Card elevation={5} sx={{ m: 1, p: 1, minHeight: "262.5px" }}>
            <Grid container item xs={12} sx={{ p: 1 }}>
                <Grid item xs={10}>
                    <Controller
                        name={`case_attributes.${itemIndex}.name`}
                        control={formControl}
                        rules={{ required: REQUIRED_ERROR_MSG }}
                        render={({ field: { ref, ...others } }) => {
                            return (
                                <TextField
                                    {...others}
                                    inputRef={ref}
                                    style={{ width: "100%" }}
                                    error={currentCaseAttributeErrors?.name !== undefined}
                                    helperText={currentCaseAttributeErrors?.name?.message || ""}
                                    variant="standard"
                                    placeholder="Resource pool name"
                                    label={"Case Attribute's Name"}
                                />
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={2} className={classes.centeredGrid}>
                    <DeleteButtonToolbar
                        onClick={onContinuousCaseAttrDelete}
                        labelName="Delete"
                        tooltipText={"Delete the case attribute"}
                    />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" align="left">
                        Value Distribution
                    </Typography>
                    <TimeDistribution
                        formState={formState}
                        objectNamePath={`case_attributes.${itemIndex}.values`}
                        errors={currentCaseAttributeErrors?.values}
                        setErrorMessage={setErrorMessage}
                    />
                </Grid>
            </Grid>
        </Card>
    )
}

export default ContinuousCaseAttr;
