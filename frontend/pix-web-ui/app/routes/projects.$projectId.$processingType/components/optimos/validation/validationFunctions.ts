import type { Validate } from "react-hook-form";
import type { ConsParams, ConstraintWorkMask, SimParams } from "~/shared/optimos_json_type";
import { bitmaskToSelectionIndexes } from "../helpers";

export const createValidateNeverWorkMask: (
  resourceId: string,
  day: string,
  simParams: SimParams
) => Validate<number, ConsParams> = (resourceId, day, simParams) => (mask, constraints) => {
  const work_times = simParams.resource_calendars.find((calendar) => calendar.id === resourceId)?.time_periods;
  if (!work_times) return "Resource not found";
  const hours = bitmaskToSelectionIndexes(mask);
  const workHours = work_times
    .filter((time) => time.from === day)
    .map((time) => parseInt(time.beginTime.split(":")[0]));

  if (hours.some((hour) => workHours.includes(hour))) {
    return "Resource is working during these hours.";
  }
};
