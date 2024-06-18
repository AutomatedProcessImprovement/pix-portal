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

  const minCycleTimeDeviation = Math.min(devDominant.cycle_time_deviation, devDominated.cycle_time_deviation);
  const meanCycleTimeChange = Math.abs(
    dominatedInfo.solution_info.mean_process_cycle_time - dominantInfo.solution_info.mean_process_cycle_time
  );

  const simulationTimeChange = Math.abs(
    dominatedInfo.solution_info.simulation_time - dominantInfo.solution_info.simulation_time
  );
  const minDurationDeviation = Math.min(
    devDominant.execution_duration_deviation,
    devDominated.execution_duration_deviation
  );

  return (
    isNonMadDominated(dominatedInfo, dominantInfo) &&
    meanCycleTimeChange > minCycleTimeDeviation &&
    simulationTimeChange > minDurationDeviation
  );
};
