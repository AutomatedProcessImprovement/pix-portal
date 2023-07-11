import { useEffect, useState } from "react"
import { CaseAttributeDefinition, PriorityRule } from "../formData"
import { collectAllCaseAttrWithTypes, ValueOptionsByAttrName } from "../prioritisation/caseAttributesCollectorAndTransformer"

type ErrorsByPath = {
    [path: string]: string
}

export type UpdateAndRemovePrioritisationErrors = [
    (path: string, message: string) => void,
    (path: string) => void
]

const usePrioritisationErrors = (caseAttrsProps: CaseAttributeDefinition[], initialRulesProps: PriorityRule[]) => {
    const [prioritisationRulesErrors, setPrioritisationRulesErrors] = useState<ErrorsByPath>({})
    const [isPrioritisationRulesValid, setIsPrioritisationRulesValid] = useState(true)
    const [caseAttributes, setCaseAttributes] = useState<CaseAttributeDefinition[]>([])
    const [possibleValueOptions, setPossibleValueOptions] = useState<ValueOptionsByAttrName>({})

    useEffect(() => {
        if (caseAttributes !== caseAttrsProps) {
            setCaseAttributes(caseAttrsProps)
            const [_, possibleOptions] = collectAllCaseAttrWithTypes(caseAttrsProps, true)
            setPossibleValueOptions(possibleOptions)
        }
    }, [caseAttrsProps])

    useEffect(() => {
        console.log(initialRulesProps, possibleValueOptions)
        if (initialRulesProps === undefined || Object.keys(possibleValueOptions).length === 0) {
            return
        }

        const accErrors: ErrorsByPath = {}

        // go through each rule and check whether a valid value was used
        initialRulesProps.forEach((priorityRule, ruleIndex) => {
            priorityRule.rules.forEach((orRule, orRuleIndex) => {
                orRule.forEach((andRule, andRuleIndex) => {
                    const caseAttributeType = caseAttributes.find(i => i.name === andRule.attribute)?.type || ""
                    if (caseAttributeType === "discrete") {
                        // verify that provided discrete value is in the list of possible values
                        const caseAttrName = andRule.attribute
                        const value = andRule.value as string
                        const validValuesArr = possibleValueOptions[caseAttrName] ?? []
                        if (!validValuesArr.includes(value)) {
                            const path = `prioritisation_rules.${ruleIndex}.rules.${orRuleIndex}.${andRuleIndex}.value`
                            accErrors[path] = "Invalid value"
                        }
                    }
                })
            })
        })

        setPrioritisationRulesErrors(accErrors)
    }, [initialRulesProps, possibleValueOptions])

    useEffect(() => {
        const isValidNew = Object.keys(prioritisationRulesErrors).length === 0
        if (isValidNew !== isPrioritisationRulesValid) {
            setIsPrioritisationRulesValid(isValidNew)
        }
    }, [isPrioritisationRulesValid, prioritisationRulesErrors])

    const updateErrors = (path: string, message: string) => {
        setPrioritisationRulesErrors({
            ...prioritisationRulesErrors,
            [path]: message
        })
    }

    const removeErrorByPath = (path: string) => {
        const { [path]: _, ...rest } = prioritisationRulesErrors

        setPrioritisationRulesErrors(rest)
    }

    return { isPrioritisationRulesValid, updateErrors, removeErrorByPath }
}

export default usePrioritisationErrors;
