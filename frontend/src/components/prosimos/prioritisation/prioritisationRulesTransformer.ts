import { CaseBasedRule, JsonData, PriorityRule } from "../formData";

/**
 * Transforming the prioritisation rules
 * In case the value was not a range one, we change it to be a range
 * Equals rules stay the same
 * For between rules, we just change the operator name supported by 
 */
export const transformPrioritisationRules = (values: JsonData) => {
    const copiedValues = JSON.parse(JSON.stringify(values))
    const prioritisation_rules = copiedValues.prioritisation_rules // array per each priority level

    if (prioritisation_rules !== undefined) {
        prioritisation_rules.forEach((element: PriorityRule) => {
            _transformRulesToRangesIfAny(element.rules)
        })
    }

    return copiedValues
};

const _transformRulesToRangesIfAny = (orRules: CaseBasedRule[][]) => {
    let newValueArr: (number | "inf")[];

    for (let orRule of orRules) {
        for (let andRule of orRule) {
            if (andRule.comparison !== "=") {
                // no changes in case operator equals =
                switch (andRule.comparison) {
                    case "<=":
                        andRule.comparison = "in"
                        newValueArr = [0, andRule.value as number]
                        andRule.value = newValueArr
                        break
                    case ">=":
                        andRule.comparison = "in"
                        newValueArr = [andRule.value as number, "inf"]
                        andRule.value = newValueArr
                        break
                    case "in":
                        andRule.comparison = "in"
                        break
                    default:
                        console.log("Not a supported operator")
                }
            }
        }
    }
}
