import { Grid } from "@mui/material"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { CaseAttributeDefinition, JsonData } from "../formData"
import DiscreteCaseAttr from "./DiscreteCaseAttr"
import ContinuousCaseAttr from "./ContinuousCaseAttr"
import { defaultDiscreteCaseAttr, defaultContinuousCaseAttr } from "../simulationParameters/defaultValues"
import { AutoSizer, List } from "react-virtualized"
import { useEffect, useRef, useState } from "react"
import NoItemsCard from "../emptyComponents/NoItemsCard"
import { collectUniqueAtrrs, ValuesByCaseAttr } from "./caseAttributesUniqueCollector"
import AllCaseAttributesToolbar, { DiscreteOrContinuousString, DISCRETE_STRING, CONTINUOUS_STRING } from "./AllCaseAttributesToolbar"

const CASE_ATTRIBUTES_PATH = "case_attributes"

interface AllCaseAttributesProps {
    formState: UseFormReturn<JsonData, object>
    setErrorMessage: (value: string) => void
}

const AllCaseAttributes = (props: AllCaseAttributesProps) => {
    const { formState: { control: formControl, getValues }, setErrorMessage } = props
    const listRef = useRef<List>(null)
    const [isAnyCaseAttrs, setIsAnyCaseAttrs] = useState(false)
    const [referencedAttrs, setReferencedAttrs] = useState<Set<string>>(new Set())
    const [referencedValuesByCaseAttr, setReferencedValuesByCaseAttr] = useState<ValuesByCaseAttr>({})

    const { fields, prepend, remove } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `${CASE_ATTRIBUTES_PATH}`
    })

    useEffect(() => {
        const [newReferencedAttrs, newReferencedValuesByCaseAttr] = collectUniqueAtrrs(getValues("prioritisation_rules"))

        setReferencedAttrs(newReferencedAttrs)
        setReferencedValuesByCaseAttr(newReferencedValuesByCaseAttr)
    }, [])

    useEffect(() => {
        const isAny = fields.length > 0
        if (isAny !== isAnyCaseAttrs) {
            setIsAnyCaseAttrs(isAny)
        }
    }, [fields])

    const removeByIndex = (index: number) => {
        const itemName = getValues(`case_attributes.${index}.name`)
        const isReferencedInPrioritisationRules = referencedAttrs.has(itemName)
        if (isReferencedInPrioritisationRules) {
            setErrorMessage(
                "Case Attribute is referenced in one or many prioritisation rules. Remove those rules first"
            )
        }
        else {
            remove(index)
        }
    }

    const getCaseAttrComponent = (item: CaseAttributeDefinition, itemIndex: number): JSX.Element => {
        const ComponentToReturn = (({ [DISCRETE_STRING]: DiscreteCaseAttr, [CONTINUOUS_STRING]: ContinuousCaseAttr })[item.type] ?? undefined)

        if (ComponentToReturn === undefined) {
            return <div>Invalid type of a case attribute</div>
        }

        return (
            <ComponentToReturn
                formState={props.formState}
                setErrorMessage={props.setErrorMessage}
                itemIndex={itemIndex}
                remove={removeByIndex}
                referencedValuesByCaseAttr={referencedValuesByCaseAttr[item.name] ?? {}}
            />
        )
    }

    const onAddNew = (type: DiscreteOrContinuousString) => {
        const itemToAdd = (type === DISCRETE_STRING)
            ? defaultDiscreteCaseAttr
            : defaultContinuousCaseAttr

        prepend(itemToAdd)
    }

    const renderRow = ({ index, key, style }: any) => {
        const currCaseAttr = fields[index]

        return (
            <Grid item xs={12} style={{ ...style }} key={currCaseAttr.key}>
                {getCaseAttrComponent(currCaseAttr, index)}
            </Grid>
        )
    }

    const getItemListOrEmptyCard = () => {
        return (
            (!isAnyCaseAttrs)
                ? <NoItemsCard
                    noItemsTitle={"No case attributes defined"}
                />
                : (
                    <Grid item xs={12} style={{ minHeight: "56vh" }}>
                        <AutoSizer>
                            {({ width, height }) => {
                                return <List
                                    ref={listRef}
                                    width={width}
                                    height={height}
                                    rowHeight={300}
                                    rowRenderer={renderRow}
                                    rowCount={fields.length}
                                    overscanRowCount={2}
                                />
                            }}
                        </AutoSizer>
                    </Grid>
                )
        )
    }

    return <Grid container item xs={12} spacing={2}>
        <AllCaseAttributesToolbar
            onAddNew={onAddNew}
        />
        {getItemListOrEmptyCard()}
    </Grid >
}

export default AllCaseAttributes;
