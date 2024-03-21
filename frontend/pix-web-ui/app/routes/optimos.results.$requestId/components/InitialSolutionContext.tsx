import { createContext, useContext } from "react";
import { Solution } from "~/shared/optimos_json_type";

export const InitialSolutionContext = createContext<Solution | undefined>(undefined);

export const useInitialSolution = () => {
  const initialSolution = useContext(InitialSolutionContext);
  if (initialSolution === undefined) {
    throw new Error("useInitialSolution must be used within a InitialSolutionProvider");
  }
  return initialSolution;
};

export const useInitialResource = (resourceId: string) => {
  const initialSolution = useInitialSolution();
  const resource = initialSolution.solution_info.pools_info.pools[resourceId];
  return resource;
};
export const useInitialResourceStats = (resourceId: string) => {
  const initialSolution = useInitialSolution();
  const {
    pool_time,
    pool_cost,
    pool_utilization,
    available_time,
    pools_info: { task_allocations, task_pools },
  } = initialSolution.solution_info;
  return {
    total_worktime: pool_time[resourceId],
    total_cost: pool_cost[resourceId],
    utilization: pool_utilization[resourceId],
    available_time: available_time[resourceId],
    tasks: task_allocations[resourceId].map((taskIndex) => {
      return Object.keys(task_pools)[taskIndex];
    }),
  };
};

export const useInitialEnhancedResource = (resourceId: string) => {
  const initialResource = useInitialResource(resourceId);
  const initialResourceStats = useInitialResourceStats(resourceId);
  const initialEnhancedResource = { ...initialResource, ...initialResourceStats };
  return initialEnhancedResource;
};

export const getBaseName = (resourceName: string) => resourceName.replace(/_COPY.*$/, "");

export const useInitialEnhancedResourceByName = (resourceName: string) => {
  const initialSolution = useInitialSolution();
  const pools = initialSolution.solution_info.pools_info.pools;
  const resourceId = Object.keys(pools).find((id) => pools[id].resource_name === getBaseName(resourceName));
  if (resourceId === undefined) {
    throw new Error(`Resource with name ${resourceName} not found`);
  }
  return useInitialEnhancedResource(resourceId);
};
