import { useEffect, useState } from "react"
import { Dictionary } from "../helpers"

export enum TABS {
    GLOBAL_CONSTRAINTS,
    SCENARIO_CONSTRAINTS,
    RESOURCE_CONSTRAINTS,
    SIMULATION_RESULTS,
}

const tabsName: Record<string, string> = {
    GLOBAL_CONSTRAINTS: "Global Constraints",
    SCENARIO_CONSTRAINTS: "Scenario Constraints",
    RESOURCE_CONSTRAINTS: "Resource Constraints",
    SIMULATION_RESULTS: "Simulation Results",
}

const useTabVisibility = () => {
    const [visibleTabs, setVisibleTabs] = useState(new Dictionary<string>())

    const getIndexOfTab = (value: TABS): number => {
        return visibleTabs.getAllKeys().indexOf(TABS[value])
    }

    useEffect(() => {
        if (!visibleTabs.isEmpty()) {
            // skip initialization if
            // 1) no information yet loaded
            // 2) we already have a final array
            return
        }

        const newVisibleTabs = Object.entries(tabsName).reduce(
            (acc: Dictionary<string>, [key, value]) => {
                acc.add(key, value)
                return acc
            },
            new Dictionary<string>()
        )

        setVisibleTabs(newVisibleTabs)
    }, [visibleTabs])

    return { visibleTabs, getIndexOfTab }
}

export default useTabVisibility
