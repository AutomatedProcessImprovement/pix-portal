import { PriorityRule } from "../formData"

export type ValuesByCaseAttr = {
    [caseAttrName: string]: Set<string>
}

/**
* Collect all unique case attributes referenced in the prioritisation rules
*
* @param {PriorityRule[]} rules - array of all defined prioritisation rules
* @returns {Set<string>} Set of unique case attributes
*/
export const collectUniqueAtrrs = (rules: PriorityRule[]): [Set<string>, ValuesByCaseAttr] => {
    const collectedAttr: Set<string> = new Set()
    const collectedAttrValues: ValuesByCaseAttr = {} // used value options in the rules

    if (rules === undefined || rules.length === 0) {
        return [collectedAttr, collectedAttrValues]
    }

    for (let rule of rules) {
        for (let orRules of rule["rules"]) {
            for (let andRule of orRules) {
                collectedAttr.add(andRule.attribute)
                if (typeof andRule.value === 'string') {
                    // discrete case attributes can only have string as a type for values
                    const valueStr = andRule.value as string

                    const existingSet = collectedAttrValues[andRule.attribute]
                    if (existingSet === undefined) {
                        // insert the first entrance
                        const newSet = new Set<string>([valueStr])
                        collectedAttrValues[andRule.attribute] = newSet
                    } else {
                        // add value to already existing set
                        existingSet.add(valueStr)
                    }
                }
            }
        }
    }

    return [collectedAttr, collectedAttrValues]
}
