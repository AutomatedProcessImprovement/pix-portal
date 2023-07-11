import { useEffect, useState } from "react";
import { Dictionary, EventsFromModel } from "../modelData";

export enum TABS {
    CASE_CREATION,
    RESOURCE_CALENDARS,
    RESOURCES,
    RESOURCE_ALLOCATION,
    BRANCHING_PROB,
    INTERMEDIATE_EVENTS,
    BATCHING,
    CASE_ATTRIBUTES,
    CASE_BASED_PRIORITISATION,
    SIMULATION_RESULTS
}

const tabsName: { [key: string]: string } = {
    CASE_CREATION: "Case Creation",
    RESOURCE_CALENDARS: "Resource Calendars",
    RESOURCES: "Resources",
    RESOURCE_ALLOCATION: "Resource Allocation",
    BRANCHING_PROB: "Branching Probabilities",
    INTERMEDIATE_EVENTS: "Intermediate Events",
    BATCHING: "Batching",
    CASE_ATTRIBUTES: "Case Attributes",
    CASE_BASED_PRIORITISATION: "Prioritisation",
    SIMULATION_RESULTS: "Simulation Results"
};

const useTabVisibility = (eventsFromModel?: EventsFromModel) => {
    const [visibleTabs, setVisibleTabs] = useState(new Dictionary<string>())
    const [isEventsTabHidden, setIsEventsTabHidden] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        if (eventsFromModel === undefined)
            return

        const areEventsEmpty = eventsFromModel.isEmpty()
        if (areEventsEmpty !== isEventsTabHidden) {
            setIsEventsTabHidden(areEventsEmpty)
        }
    }, [eventsFromModel])

    useEffect(() => {
        if (isEventsTabHidden === undefined || !visibleTabs.isEmpty()) {
            // skip initialization if
            // 1) no information yet loaded
            // 2) we already have a final array
            return
        }

        const newVisibleTabs = Object.entries(tabsName).reduce((acc: Dictionary<string>, [key, value]: any) => {
            if (key === TABS[TABS.INTERMEDIATE_EVENTS] && isEventsTabHidden) {
                // section is hidden, we don't add it to the general list
                return acc
            }

            acc.add(key, value)
            return acc
        }, new Dictionary<string>())

        setVisibleTabs(newVisibleTabs)
    }, [isEventsTabHidden, visibleTabs])

    const getIndexOfTab = (value: TABS): number => {
        return visibleTabs.getAllKeys().indexOf(TABS[value])
    }

    return { visibleTabs, getIndexOfTab }
}

export default useTabVisibility;