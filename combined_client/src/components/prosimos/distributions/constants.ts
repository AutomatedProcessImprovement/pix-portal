export type AllowedObjectName = "arrival_time_distribution"
    | `task_resource_distribution.${number}.resources.${number}`
    | `event_distribution.${number}`
    | `case_attributes.${number}.values`

export type AllowedDistrParamsName = "arrival_time_distribution.distribution_params"
    | `task_resource_distribution.${number}.resources.${number}.distribution_params`
    | `event_distribution.${number}.distribution_params`
    | `case_attributes.${number}.values.distribution_params`

// ordered by alphabet
export enum DISTR_FUNC {
    expon = "expon",
    fix = "fix",
    gamma = "gamma",
    lognorm = "lognorm",
    norm = "norm",
    // triang = "triang",
    uniform = "uniform",
}

const MEAN_SEC = "Mean (sec)"
export const MODE_SEC = "Mode (sec)"
const STD_DEV_SEC = "Std deviation (sec)"
const VARIANCE_SEC = "Variance (sec)"
const SHIFT_SEC = "Shift (sec)" // TODO: to be supported later
const MIN_SEC = "Min (sec)"
const MAX_SEC = "Max (sec)"

export const distrFuncWithLabelNames: { [key in DISTR_FUNC]: any[] } = {
    [DISTR_FUNC.fix]: [MEAN_SEC],
    [DISTR_FUNC.norm]: [MEAN_SEC, STD_DEV_SEC, MIN_SEC, MAX_SEC],
    [DISTR_FUNC.expon]: [MEAN_SEC, MIN_SEC, MAX_SEC],
    [DISTR_FUNC.uniform]: [MIN_SEC, MAX_SEC],
    [DISTR_FUNC.gamma]: [MEAN_SEC, VARIANCE_SEC, MIN_SEC, MAX_SEC],
    [DISTR_FUNC.lognorm]: [MEAN_SEC, VARIANCE_SEC, MIN_SEC, MAX_SEC]
    // TODO: to be supported later
    // [DISTR_FUNC.triang]: [MODE_SEC, MIN_SEC, MAX_SEC]
}

export const getNumOfParamsPerDistr = (distr_func: DISTR_FUNC) => {
    const paramsArr = distrFuncWithLabelNames[distr_func]
    if (paramsArr === undefined) {
        return 0
    }

    return paramsArr.length
}
