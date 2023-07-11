import { Card, Grid, TextField } from "@mui/material";
import { UseFormReturn, Controller } from "react-hook-form";
import { JsonData } from "../formData";
import { useSharedStyles } from "../sharedHooks/useSharedStyles";
import DeleteButtonToolbar from "../toolbar/DeleteButtonToolbar";
import { REQUIRED_ERROR_MSG } from "../validationMessages";
import DiscreteValueOptions from "./DiscreteValueOptions";

interface DiscreteCaseAttrProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
    itemIndex: number
    remove: (index: number) => void
    referencedValuesByCaseAttr: Set<string>
}

const DiscreteCaseAttr = (props: DiscreteCaseAttrProps) => {
    const { formState, formState: { control: formControl, formState: { errors } }, setErrorMessage, itemIndex, remove, referencedValuesByCaseAttr } = props
    const classes = useSharedStyles()

    const onDiscreteCaseAttrDelete = () => {
        remove(itemIndex)
    }

    const { case_attributes: caseAttributesErrors } = errors as any
    const currentCaseAttributeErrors = caseAttributesErrors?.[itemIndex]

    return (
        <Card elevation={5} sx={{ m: 1, p: 1, minHeight: "215px" }}>
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
                        onClick={onDiscreteCaseAttrDelete}
                        labelName="Delete"
                        tooltipText={"Delete the case attribute"}
                    />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <DiscreteValueOptions
                        formState={formState}
                        itemIndex={itemIndex}
                        setErrorMessage={setErrorMessage}
                        referencedValuesByCaseAttr={referencedValuesByCaseAttr}
                    />
                </Grid>
            </Grid>
        </Card>
    )
}

export default DiscreteCaseAttr;
