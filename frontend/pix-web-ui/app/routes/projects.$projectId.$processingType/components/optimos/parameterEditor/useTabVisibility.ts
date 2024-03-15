import { useEffect, useState } from "react";

export enum TABS {
  GLOBAL_CONSTRAINTS,
  SCENARIO_CONSTRAINTS,
  RESOURCE_CONSTRAINTS,
  SIMULATION_RESULTS,
}

export const TabNames: Record<string, string> = {
  GLOBAL_CONSTRAINTS: "Global Constraints",
  SCENARIO_CONSTRAINTS: "Scenario Constraints",
  RESOURCE_CONSTRAINTS: "Resource Constraints",
  // SIMULATION_RESULTS: "Simulation Results",
};

export const getIndexOfTab = (tab: TABS) => {
  return Object.keys(TabNames).indexOf(tab.toString());
};
