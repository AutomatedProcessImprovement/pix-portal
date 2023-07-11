import { PrioritisationBuilderSchema } from "../batching/schemas"
import { CaseAttributeDefinition } from "../formData"

export type ValueOptionsByAttrName = {
    [attrName: string]: string[]
}

/**
* Collect all case attributes user has defined
* Collect possible options of case attributes per each discrete case attribute
* Transform them to the object parseable for dropdown
* 
* This means we add 'type' field to each case attributes 
* which later tells us eligible list of operations for the case attribute
*
* @param {CaseAttributeDefinition[]} caseAttrsFromJson - array of all case attributes defined in a simulation scenario
* @param {boolean} onlyOptions - if true, we collect only value options per case attribute name, otherwise - both builder schema and value options
* @returns {Object} Tuple with 
* 1) Dictionary (query builder schema) with case attributes name together with the QueryBuilder type
* 2) Dictionary with case attribute name as key and all possible choices of value (valid only for discrete values)
*/
export const collectAllCaseAttrWithTypes = (caseAttrsFromJson: CaseAttributeDefinition[], onlyOptions: boolean) => {
    return caseAttrsFromJson?.reduce(
        (acc, curr) => transformCaseAttrArrToQueryBuilderSchema(acc, curr, onlyOptions),
        [{}, {}] as [PrioritisationBuilderSchema, ValueOptionsByAttrName]) ?? [{}, {}]
}

const transformCaseAttrArrToQueryBuilderSchema = (
    accObj: [PrioritisationBuilderSchema, ValueOptionsByAttrName],
    { name: currentAttrName, type, values }: CaseAttributeDefinition,
    onlyOptions: boolean
): [PrioritisationBuilderSchema, ValueOptionsByAttrName] => {
    const [accBuilderSchema, accAllDiscreteOptions] = accObj
    const isDiscrete = type === "discrete"

    let queryBuilderSchema = {}
    if (onlyOptions) {
        queryBuilderSchema = accBuilderSchema
    }
    else {
        const currVal = {
            [currentAttrName]: {
                label: currentAttrName,
                type: isDiscrete ? "priority_discrete" : "priority_continuous"
            }
        } as PrioritisationBuilderSchema
        queryBuilderSchema = {
            ...accBuilderSchema,
            ...currVal
        }
    }

    if (isDiscrete) {
        // collect all options value for current case attribute
        accAllDiscreteOptions[currentAttrName] = values.map(({ key, value }: any) => key)
    }

    return [queryBuilderSchema, accAllDiscreteOptions]
}
