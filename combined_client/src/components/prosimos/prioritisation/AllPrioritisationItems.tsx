import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { isSchemaNotEmpty, PrioritisationBuilderSchema } from "../batching/schemas";
import { JsonData } from "../formData";
import { defaultPrioritisationRule } from "../simulationParameters/defaultValues";
import { UpdateAndRemovePrioritisationErrors } from "../simulationParameters/usePrioritisationErrors";
import AllPrioritisationItemsToolbar from "./AllPrioritisationItemsToolbar";
import { collectAllCaseAttrWithTypes, ValueOptionsByAttrName } from "./caseAttributesCollectorAndTransformer";
import PrioritisationItem from "./PrioritisationItem";
import PrioritisationVirtualizedList from "./PrioritisationVirtualizedList";

interface AllPrioritisationItemsProps {
    formState: UseFormReturn<JsonData, object>
    updateAndRemovePrioritisationErrors: UpdateAndRemovePrioritisationErrors
    setErrorMessage: (value: string) => void
}

const AllPrioritisationItems = (props: AllPrioritisationItemsProps) => {
    const { formState: { control: formControl, getValues }, formState, updateAndRemovePrioritisationErrors, setErrorMessage } = props
    const [builderSchema, setBuilderSchema] = useState<PrioritisationBuilderSchema>({})
    const [discreteOptionsByCaseAttributeName, setDiscreteOptionsByCaseAttributeName] = useState<ValueOptionsByAttrName>({})

    const { fields, remove, prepend } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: 'prioritisation_rules'
    })

    const onPrioritisationItemDelete = (index: number) => {
        remove(index)
    }

    useEffect(() => {
        const [newBuilderSchema, newDiscreteOptions] = collectAllCaseAttrWithTypes(getValues("case_attributes"), false)
        if (newBuilderSchema !== builderSchema) {
            setBuilderSchema(newBuilderSchema)
        }
        if (newDiscreteOptions !== discreteOptionsByCaseAttributeName) {
            setDiscreteOptionsByCaseAttributeName(newDiscreteOptions)
        }
    }, [])

    const onAddNewPrioritisationItem = () => {
        const isBuilderSchemaNotEmpty = isSchemaNotEmpty(builderSchema)
        if (isBuilderSchemaNotEmpty) {
            prepend(defaultPrioritisationRule(builderSchema))
        } else {
            // show warning
            setErrorMessage("At least one case attribute should be defined")
        }
    }

    const renderRow = ({ index, key, style }: any) => {
        const prioritisationItemKey = fields[index].key

        return (
            <Grid item xs={12} style={{ ...style }} key={prioritisationItemKey}>
                <PrioritisationItem
                    key={prioritisationItemKey}
                    formState={formState}
                    updateAndRemovePrioritisationErrors={updateAndRemovePrioritisationErrors}
                    discreteOptionsByCaseAttributeName={discreteOptionsByCaseAttributeName}
                    builderSchema={builderSchema}
                    index={index}
                    onPrioritisationItemDelete={onPrioritisationItemDelete}
                />
            </Grid>
        )
    }

    return (
        <Grid container item xs={12} spacing={2} >
            <AllPrioritisationItemsToolbar
                onAddNew={onAddNewPrioritisationItem}
            />
            <Grid container item xs={12} style={{ paddingTop: "0px", minHeight: "56vh" }}>
                <PrioritisationVirtualizedList
                    rowHeight={300}
                    renderRow={renderRow}
                    rowCount={fields.length}
                    overscanRowCount={2}
                />
            </Grid>
        </Grid>
    )
}

export default AllPrioritisationItems;
