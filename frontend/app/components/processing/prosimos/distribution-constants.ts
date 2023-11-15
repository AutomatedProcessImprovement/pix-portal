export type AllowedObjectName =
  | "arrival_time_distribution"
  | `task_resource_distribution.${number}.resources.${number}`
  | `event_distribution.${number}`
  | `case_attributes.${number}.values`;

export type AllowedDistrParamsName =
  | "arrival_time_distribution.distribution_params"
  | `task_resource_distribution.${number}.resources.${number}.distribution_params`
  | `event_distribution.${number}.distribution_params`
  | `case_attributes.${number}.values.distribution_params`;

// ordered by alphabet
export enum DistributionType {
  expon = "expon",
  fix = "fix",
  gamma = "gamma",
  lognorm = "lognorm",
  norm = "norm",
  // triang = "triang",
  uniform = "uniform",
}

const MEAN_SEC = "Mean (sec)";
export const MODE_SEC = "Mode (sec)";
const STD_DEV_SEC = "Std deviation (sec)";
const VARIANCE_SEC = "Variance (sec)";
const SHIFT_SEC = "Shift (sec)"; // TODO: to be supported later
const MIN_SEC = "Min (sec)";
const MAX_SEC = "Max (sec)";

export const distrFuncWithLabelNames: { [key in DistributionType]: any[] } = {
  [DistributionType.fix]: [MEAN_SEC],
  [DistributionType.norm]: [MEAN_SEC, STD_DEV_SEC, MIN_SEC, MAX_SEC],
  [DistributionType.expon]: [MEAN_SEC, MIN_SEC, MAX_SEC],
  [DistributionType.uniform]: [MIN_SEC, MAX_SEC],
  [DistributionType.gamma]: [MEAN_SEC, VARIANCE_SEC, MIN_SEC, MAX_SEC],
  [DistributionType.lognorm]: [MEAN_SEC, VARIANCE_SEC, MIN_SEC, MAX_SEC],
  // TODO: to be supported later
  // [DISTR_FUNC.triang]: [MODE_SEC, MIN_SEC, MAX_SEC]
};

export const getNumOfParamsPerDistr = (distr_func: DistributionType) => {
  const paramsArr = distrFuncWithLabelNames[distr_func];
  if (paramsArr === undefined) {
    return 0;
  }

  return paramsArr.length;
};
