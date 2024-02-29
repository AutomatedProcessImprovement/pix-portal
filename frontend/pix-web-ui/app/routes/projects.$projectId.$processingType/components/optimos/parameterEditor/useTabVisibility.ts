import { useEffect, useState } from "react";

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
  // SIMULATION_RESULTS: "Simulation Results",
};

const useTabVisibility = () => {
  const [visibleTabs, setVisibleTabs] = useState<Record<string, string>>({});

  const getIndexOfTab = (value: TABS): number => {
    return Object.keys(visibleTabs).indexOf(TABS[value]);
  };

  useEffect(() => {
    if (!Object.keys(visibleTabs).length) {
      // skip initialization if
      // 1) no information yet loaded
      // 2) we already have a final array
      return;
    }

    const newVisibleTabs = Object.entries(tabsName).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    setVisibleTabs(newVisibleTabs);
  }, [visibleTabs]);

  return { visibleTabs, getIndexOfTab };
};

export default useTabVisibility;
