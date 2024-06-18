import type { Solution } from "./optimos_json_type";

export const isNonMadDominated = (dominatedInfo: Solution, dominantInfo: Solution) => {
  return (
    dominantInfo.solution_info.mean_process_cycle_time < dominatedInfo.solution_info.mean_process_cycle_time &&
    dominantInfo.solution_info.total_pool_cost < dominatedInfo.solution_info.total_pool_cost
  );
};

export const isMadDominated = (dominatedInfo: Solution, dominantInfo: Solution) => {
  const devDominated = dominatedInfo.solution_info.deviation_info;
  const devDominant = dominantInfo.solution_info.deviation_info;
  return (
    Math.abs(dominatedInfo.solution_info.mean_process_cycle_time - dominantInfo.solution_info.mean_process_cycle_time) >
      Math.min(devDominant.cycle_time_deviation, devDominated.cycle_time_deviation) &&
    Math.abs(dominatedInfo.solution_info.simulation_time - dominantInfo.solution_info.simulation_time) >
      Math.min(devDominant.execution_duration_deviation, devDominated.execution_duration_deviation)
  );
};
