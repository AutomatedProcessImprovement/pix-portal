export interface FinalSolutionMetric {
  name: string;
  func_ev: number;
  total_explored: number;
  pareto_size: number;
  in_jp: number;
  not_in_jp: number;
  hyperarea: number;
  hausd_dist: number;
  delta_sprd: number;
  purity_rate: number;
  ave_time: number;
  ave_cost: number;
  time_metric: number;
  cost_metric: number;
}

export interface FullOutputJson {
  name: string;
  initial_simulation_info: SolutionInfo;
  final_solutions?: SolutionInfo[];
  current_solution_info: SolutionInfo;
  final_solution_metrics?: FinalSolutionMetric;
}

export interface SolutionInfo {
  pools_info: PoolsInfo;
  mean_process_cycle_time: number;
  simulation_start_date: Date;
  simulation_end_date: Date;
  simulation_time: number;
  deviation_info: DeviationInfo;
  pool_utilization: { [key: string]: number };
  pool_time: { [key: string]: number };
  pool_cost: { [key: string]: number };
  total_pool_cost: number;
  total_pool_time: number;
  available_time: { [key: string]: number };
}

export interface DeviationInfo {
  cycle_time_deviation: number;
  execution_duration_deviation: number;
  dev_type: number;
}

export interface PoolsInfo {
  pools: { [key: string]: Resource };
  task_pools: { [key: string]: TaskPool[] };
  task_allocations: { [key: string]: number[] };
  id: string;
}

export interface Resource {
  id: string;
  resource_name: string;
  time_var: number;
  total_amount: number;
  cost_per_hour: number;
  custom_id: string;
  max_weekly_cap: number;
  max_daily_cap: number;
  max_consecutive_cap: number;
  max_shifts_day: number;
  max_shifts_week: number;
  is_human: boolean;
  daily_start_times: DailyStartTimes;
  never_work_masks: ConstraintWorkMask;
  always_work_masks: ConstraintWorkMask;
  day_free_cap: ConstraintWorkMask;
  remaining_shifts: ConstraintWorkMask;
  shifts: Shift[];
}

export interface ConstraintWorkMask {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}
export interface Shift {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  total?: number;
  resource_id?: string;
}

export interface DailyStartTimes {
  monday: null | string;
  tuesday: null | string;
  wednesday: null | string;
  thursday: null | string;
  friday: null | string;
  saturday: null | string;
  sunday: null | string;
}

export interface TaskPool {
  id: string;
  name: string;
  cost_per_hour: number;
  amount: number;
  calendar: string;
  assigned_tasks: string[];
}
