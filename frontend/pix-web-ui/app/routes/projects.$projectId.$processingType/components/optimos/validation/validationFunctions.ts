import type { Validate } from "react-hook-form";
import type { ConsParams, ConstraintWorkMask, SimParams } from "~/shared/optimos_json_type";
import type { DAYS } from "../helpers";
import { bitmaskToSelectionIndexes, timePeriodToBinary } from "../helpers";
import type { MasterFormData } from "../hooks/useMasterFormData";

export const createValidateNeverWorkMask: (resourceIndex: number, day: string) => Validate<number, MasterFormData> =
  (resourceIndex, day) => (mask, masterForm) => {
    const work_times = masterForm.simulationParameters!.resource_calendars[resourceIndex].time_periods;

    if (!work_times) return "Resource not found";

    const workHours = work_times
      .filter((time) => time.from.toLocaleLowerCase() === day.toLocaleLowerCase())
      .map((time) => timePeriodToBinary(time.beginTime, time.endTime))
      .reduce((acc, val) => acc | val, 0);

    console.log(
      "workHours",
      day,
      workHours.toString(2),
      mask.toString(2),
      (mask & workHours) !== 0,
      JSON.stringify(work_times)
    );

    if ((mask & workHours) !== 0) {
      return "Resource is working during these hours.";
    }

    return true;
  };

export const createValidateAlwaysWorkMask: (
  resourceIndex: number,
  day: (typeof DAYS)[number]
) => Validate<number, MasterFormData> = (resourceIndex, day) => (mask, masterForm) => {
  const never_work_masks = masterForm.constraints!.resources[resourceIndex].constraints.never_work_masks[day];

  if (!never_work_masks) return true;

  if ((mask & never_work_masks) !== 0) {
    return "There is a conflict with the never work hours.";
  }

  return true;
};
