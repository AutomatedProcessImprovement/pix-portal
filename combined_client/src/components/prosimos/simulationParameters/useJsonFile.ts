import { useEffect, useState } from "react";
import { CaseBasedRule, FiringRule, JsonData, PriorityRule } from "../formData";
import { EventsFromModel } from "../modelData";

const BETWEEN_OPERATOR = "between"
const LARGE_WT_ATTR = "large_wt"
const READY_WT_ATTR = "ready_wt"
const DAILY_HOUR_ATTR = "daily_hour"

const useJsonFile = (jsonFile: any, eventsFromModel?: EventsFromModel) => {
    // shows num of elements that were present in the config but were absent in BPMN model
    const [missedElemNum, setMissedElemNum] = useState(0)
    const [jsonData, setJsonData] = useState<JsonData>()

    useEffect(() => {
        if (jsonFile !== null && jsonFile !== "" && eventsFromModel !== undefined) {
            const jsonFileReader = new FileReader();
            jsonFileReader.readAsText(jsonFile, "UTF-8")
            jsonFileReader.onload = e => {
                if (e.target?.result && typeof e.target?.result === 'string') {
                    const rawData = JSON.parse(e.target.result)

                    // verify events in the config
                    // remove those that do not exist in the BPMN model
                    const mergeResults = getMergeEventsList(eventsFromModel, rawData["event_distribution"])
                    const [missedNum, finalEvents] = mergeResults
                    rawData["event_distribution"] = finalEvents

                    parseAndUpdatePrioritisationRules(rawData)
                    updateRangesForBatchingRulesIfAny(rawData)

                    setJsonData(rawData)
                    setMissedElemNum(missedNum)
                }
            }
        }
    }, [jsonFile, eventsFromModel]);

    return { jsonData, missedElemNum }
}

const parseAndUpdatePrioritisationRules = (rawData: any) => {
    const prioritisationRulesArr: [] = rawData["prioritisation_rules"]

    if (prioritisationRulesArr === undefined || prioritisationRulesArr.length === 0) {
        // nothing to do, array is empty
        return
    }
    const parsePrioritisationRules: PriorityRule[] = []

    for (let orRule of prioritisationRulesArr) {
        const parsedRule: CaseBasedRule[][] = []

        for (let andRule of (orRule as any)["rules"]) {
            const parsedAndRules: CaseBasedRule[] = []

            for (let simpleRule of andRule) {
                const condition: string = simpleRule["comparison"]

                const [minValue, maxValue] = simpleRule["value"]
                if (condition === "in") {
                    // TODO: add validation when the infinite range is provided
                    if (minValue === 0) {
                        // no lower boundary, so we transform the rule to <=
                        parsedAndRules.push({
                            attribute: simpleRule["attribute"],
                            comparison: "<=",
                            value: maxValue
                        } as CaseBasedRule)
                    }
                    else if (maxValue === "inf") {
                        // no lower boundary, so we transform the rule to >=
                        parsedAndRules.push({
                            attribute: simpleRule["attribute"],
                            comparison: ">=",
                            value: minValue
                        } as CaseBasedRule)
                    }
                    else {
                        // both boundaries exist, so it is a range
                        parsedAndRules.push({
                            attribute: simpleRule["attribute"],
                            comparison: simpleRule["comparison"],
                            value: simpleRule["value"]
                        } as CaseBasedRule)
                    }
                }
                else {
                    parsedAndRules.push({
                        attribute: simpleRule["attribute"],
                        comparison: simpleRule["comparison"],
                        value: simpleRule["value"]
                    } as CaseBasedRule)
                }
            }

            parsedRule.push(parsedAndRules)
        }

        parsePrioritisationRules.push({
            priority_level: orRule["priority_level"],
            rules: parsedRule
        })
    }

    rawData["prioritisation_rules"] = parsePrioritisationRules
}

/**
 * Merge events from BPMN with the configuration provided in .json file.
 * BPMN overrides the .json.
 * If event exists in BPMN but not in json      - we add it with empty distribution.
 * If an event exists in json but not in BPMN   - we ignore it and show the warning.
 */
const getMergeEventsList = (eventsFromModel: EventsFromModel, eventsConfig: any) => {
    const eventsArr = eventsFromModel.getAllKeys()
    if (eventsArr.length === 0) {
        // no events in the BPMN model
        const events_config_num = eventsConfig ? eventsConfig.length : 0
        return [events_config_num, []] as const
    }

    const allModelEvents: string[] = []
    const finalEvents = eventsArr.map((eventId: string) => {
        allModelEvents.push(eventId)
        const sameEventFromConfig = eventsConfig.find((config: { event_id: string; }) => config.event_id === eventId)
        if (sameEventFromConfig === undefined) {
            return {
                event_id: eventId
            }
        }

        return { ...sameEventFromConfig }
    })

    const difference: string[] = eventsConfig.filter((e: any) => !allModelEvents.includes(e.event_id));
    const missedNum = difference.length

    return [missedNum, finalEvents] as const
};

const updateRangesForBatchingRulesIfAny = (rawData: JsonData) => {
    const batching_info = rawData.batch_processing // array per task
    for (var task_batch_info_index in batching_info) {
        const curr_task_batch_rules = batching_info[task_batch_info_index].firing_rules
        _transformMultiStatToBetweenOps(curr_task_batch_rules)
    }
};

export const _groupByEligibleForBetweenAndNot = (
    result: [FiringRule[], FiringRule[], FiringRule[], FiringRule[]], current: FiringRule
): [FiringRule[], FiringRule[], FiringRule[], FiringRule[]] => {
    const [ready_res, large_res, daily_hour_res, others] = result
    switch (current.attribute) {
        case READY_WT_ATTR:
            ready_res.push(current)
            break
        case LARGE_WT_ATTR:
            large_res.push(current)
            break
        case DAILY_HOUR_ATTR:
            daily_hour_res.push(current)
            break
        default:
            others.push(current)
            break
    }

    return [ready_res, large_res, daily_hour_res, others]
}

/**
 * On load, change rules from pair of two with >= and <= to between
 * @param firing_rules list of rules (filtered by specific type, e.g. only ready_wt or large_wt)
 */
const _transformMultiStatToBetweenOps = (firing_rules: FiringRule[][]) => {
    for (var or_rule_index in firing_rules) {
        const curr_and_rules = firing_rules[or_rule_index]
        const [ready_wt_rules, large_wt_rules, daily_hour_rules, others] =
            curr_and_rules.reduce(_groupByEligibleForBetweenAndNot, [[], [], [], []] as [FiringRule[], FiringRule[], FiringRule[], FiringRule[]])

        let ready_wt_new_rule = undefined
        let large_wt_new_rule = undefined
        let daily_hour_new_rule = undefined

        if (ready_wt_rules.length > 0) {
            ready_wt_new_rule = getNewReadyWtRules(ready_wt_rules)
        }

        if (large_wt_rules.length > 0) {
            large_wt_new_rule = getNewLargeWtRules(large_wt_rules)
        }

        if (daily_hour_rules.length > 0) {
            daily_hour_new_rule = getNewDailyHourRules(daily_hour_rules)
        }

        const new_and_rule = [
            ...others,
            ...(ready_wt_new_rule ? ready_wt_new_rule : []),
            ...(large_wt_new_rule ? large_wt_new_rule : []),
            ...(daily_hour_new_rule ? daily_hour_new_rule : [])
        ]

        // assign a new set of rules as the final one
        firing_rules[or_rule_index] = new_and_rule
    }
}

const _getMinAndMaxRules = (rules: FiringRule[]): [string, string] | undefined => {
    // calculate lower and upper boundary based on input rules in json
    const [minValueFromRules, maxValueFromRules] = rules.reduce(_getLowerAndUpperBoundary, [undefined, undefined] as [number | undefined, number | undefined])

    // lower value of undefined transform to 0
    const minValueResult = isNaN(Number(minValueFromRules)) ? 0 : minValueFromRules!

    if (maxValueFromRules === undefined)
        // we always need to have an upper boundary
        return undefined

    return [String(minValueResult), String(maxValueFromRules)]
}

const _getLowerAndUpperBoundary = (acc: [number | undefined, number | undefined], curr: FiringRule) => {
    const comparison = curr.comparison
    const [lower, upper] = acc
    let newAcc: [number | undefined, number | undefined]

    switch (comparison) {
        case '>':
            newAcc = [Number(curr.value) + 1, upper]
            break
        case '>=':
            newAcc = [Number(curr.value), upper]
            break
        case '<':
            newAcc = [lower, Number(curr.value) - 1]
            break
        case '<=':
            newAcc = [lower, Number(curr.value)]
            break
        default:
            newAcc = acc
    }

    return newAcc
}

/**
 * Returns the first occurence of the rule with the specified comparison operator
 * @param rules list of rules
 * @param value operator with which we compare (e.g., "=")
 * @returns either rule with 'value' operator or undefined
 */
const _isEqualOperator = (rules: FiringRule[], value: string) => {
    const equalRule = rules.find((v: FiringRule) => _isEqualAny(v.comparison, [value]))
    return equalRule
}

const getNewReadyWtRules = (ready_wt_rules: FiringRule[]) => {
    let ready_wt_new_rule = undefined

    const equalRule = _isEqualOperator(ready_wt_rules, "=")
    if (equalRule !== undefined) {
        ready_wt_new_rule = [equalRule]
    } else {
        const result = _getMinAndMaxRules(ready_wt_rules)
        if (result === undefined) {
            console.log(`Invalid setup for ${READY_WT_ATTR} rules ${ready_wt_rules}`)
        }

        ready_wt_new_rule = [{
            attribute: READY_WT_ATTR,
            comparison: BETWEEN_OPERATOR,
            value: result!
        }]
    }

    return ready_wt_new_rule
}

const getNewLargeWtRules = (large_wt_rules: FiringRule[]) => {
    let ready_wt_new_rule = undefined

    const equalRule = _isEqualOperator(large_wt_rules, "=")
    if (equalRule !== undefined) {
        ready_wt_new_rule = [equalRule]
    } else {
        const result = _getMinAndMaxRules(large_wt_rules)
        if (result === undefined) {
            console.log(`Invalid setup for ${LARGE_WT_ATTR} rules ${large_wt_rules}`)
        }

        ready_wt_new_rule = [{
            attribute: LARGE_WT_ATTR,
            comparison: BETWEEN_OPERATOR,
            value: result!
        }]
    }

    return ready_wt_new_rule
}

const getNewDailyHourRules = (daily_hour_rules: FiringRule[]) => {
    let daily_hour_new_rule = undefined

    const equalRule = _isEqualOperator(daily_hour_rules, "=")
    if (equalRule !== undefined) {
        daily_hour_new_rule = [equalRule]
    } else {
        const minValue = daily_hour_rules.find((v: FiringRule) => _isEqualAny(v.comparison, ['>', '>=']))?.value
        const maxValue = daily_hour_rules.find((v: FiringRule) => _isEqualAny(v.comparison, ['<', '<=']))?.value

        if (maxValue === undefined) {
            console.log(`Invalid setup for ${DAILY_HOUR_ATTR} rules ${daily_hour_rules}`)
        }

        const minValueResult = isNaN(Number(minValue)) ? 0 : minValue!
        const value = [String(minValueResult), String(maxValue!)]

        daily_hour_new_rule = [{
            attribute: DAILY_HOUR_ATTR,
            comparison: BETWEEN_OPERATOR,
            value: value
        }]
    }

    return daily_hour_new_rule
}

const _isEqualAny = (value: string, possible_options: string[]) => {
    for (const option_index in possible_options) {
        const curr_res = value === possible_options[option_index]

        if (curr_res) {
            return curr_res
        }
    }

    return false
}

/**
 * Move from between notation to range (>= and <= convention)
 * @param rules array of FiringRules defined on UI
 * @returns array of new FiringRules suitable for writing to json
 */
export const transformFromBetweenToRange = (rules: FiringRule[]) => {
    let new_rules = []
    if (rules[0].comparison === BETWEEN_OPERATOR) {
        // expect one BETWEEN rule
        const values = (rules[0]!.value as string[]).map(x => Number(x))

        const min_value = values[0]
        const max_value = values[1]
        const attr = rules[0].attribute

        new_rules = [
            { attribute: attr, comparison: "<=", value: String(max_value) } as FiringRule
        ]

        if (min_value !== 0) {
            // add lower boundary only in case it's not 0
            new_rules = [
                ...new_rules,
                { attribute: attr, comparison: ">=", value: String(min_value) } as FiringRule
            ]
        }
    } else {
        // equals operator
        new_rules = [
            rules[0]
        ]
    }

    return new_rules
}

export default useJsonFile;
