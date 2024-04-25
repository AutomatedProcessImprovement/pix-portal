import moment from "moment";
import type { ConsParams, TimePeriod } from "~/shared/optimos_json_type";
import type { MasterFormData } from "./hooks/useMasterFormData";
import type { FieldErrors, FieldPath, GlobalError } from "react-hook-form";

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
// Generate an array of 24 hours
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const timePeriodToBinary = (startTime: string, endTime: string, delta: number = 60, num_slots: number = 24) => {
  const start_of_day = moment(new Date("1970-01-01T00:00:00"));
  const tp_start = moment(new Date("1970-01-01T" + startTime));
  const tp_end = moment(new Date("1970-01-01T" + endTime));

  let res = "";

  const current = start_of_day;
  for (let i = 0; i < num_slots; i++) {
    if (current.isBetween(tp_start, tp_end, "minute", "[)")) {
      res += "1";
    } else {
      res += "0";
    }
    current.add(delta, "minutes");
    // console.log(current.format('hh:mm:ss'))
  }
  return parseInt(res, 2);
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const applyConstraintsToResources = (
  resources: ConsParams["resources"],
  srcResourceId: string,
  targetResourceIds: string[]
) => {
  const srcConstraints = resources.find((resource) => resource.id === srcResourceId)?.constraints;
  if (!srcConstraints) return resources;

  for (const targetResourceId of targetResourceIds) {
    if (targetResourceId === srcResourceId) continue;
    const targetResource = resources.find((resource) => resource.id === targetResourceId);
    if (!targetResource) continue;

    targetResource.constraints = deepClone(srcConstraints);
  }

  return resources;
};

// Converts an array of indexes to a bitmask
// with index 23 being the first bit (rightmost bit)
// and index 0 being the last bit (leftmost bit)
// the array doesn't have to be sorted
export const selectionIndexesToBitmask = (indexes: number[]) => {
  let mask = 0;
  for (const index of indexes) {
    mask |= 1 << (23 - index);
  }
  return mask;
};

export const bitmaskToSelectionIndexes = (mask: number) => {
  const indexes = [];
  for (let i = 0; i < 24; i++) {
    if (mask & (1 << i)) indexes.push(23 - i);
  }
  return indexes;
};

export const BLANK_CONSTRAINTS = {
  never_work_masks: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
  always_work_masks: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
};

export const NINE_TO_FIVE_BITMASK = selectionIndexesToBitmask([
  0, // 0:00 -> 1:00
  0, // 1:00 -> 2:00
  0, // 2:00 -> 3:00
  0, // 3:00 -> 4:00
  0, // 4:00 -> 5:00
  0, // 5:00 -> 6:00
  0, // 6:00 -> 7:00
  0, // 7:00 -> 8:00
  0, // 8:00 -> 9:00
  1, // 9:00 -> 10:00
  1, // 10:00 -> 11:00
  1, // 11:00 -> 12:00
  1, // 12:00 -> 13:00
  1, // 13:00 -> 14:00
  1, // 14:00 -> 15:00
  1, // 15:00 -> 16:00
  1, // 16:00 -> 17:00
  0, // 17:00 -> 18:00
  0, // 18:00 -> 19:00
  0, // 19:00 -> 20:00
  0, // 20:00 -> 21:00
  0, // 21:00 -> 22:00
  0, // 22:00 -> 23:00
  0, // 23:00 -> 24:00
]);

export const NINE_TO_FIVE_CONSTRAINTS = {
  never_work_masks: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
  always_work_masks: {
    monday: NINE_TO_FIVE_BITMASK,
    tuesday: NINE_TO_FIVE_BITMASK,
    wednesday: NINE_TO_FIVE_BITMASK,
    thursday: NINE_TO_FIVE_BITMASK,
    friday: NINE_TO_FIVE_BITMASK,
    saturday: 0,
    sunday: 0,
  },
};

export const resetResourceConstraintsToBlank = (oldResources: ConsParams["resources"], resourceId: string) => {
  const resources = deepClone(oldResources);
  const resource = resources.find((resource) => resource.id === resourceId);
  if (!resource) return resources;

  resource.constraints = {
    ...resource.constraints,
    ...BLANK_CONSTRAINTS,
  };

  return [...resources];
};

export const resetResourceConstraintsToNineToFive = (oldResources: ConsParams["resources"], resourceId: string) => {
  const resources = deepClone(oldResources);
  const resource = resources.find((resource) => resource.id === resourceId);
  if (!resource) return resources;

  resource.constraints = {
    ...resource.constraints,
    ...NINE_TO_FIVE_CONSTRAINTS,
  };

  return [...resources];
};

export const isTimePeriodInHour = (timePeriod: TimePeriod, hour: number) => {
  const from = parseInt(timePeriod.beginTime.split(":")[0]);
  const to = parseInt(timePeriod.endTime.split(":")[0]);
  return hour >= from && hour < to;
};

export const isTimePeriodInDay = (timePeriod: TimePeriod, day: string) => {
  return timePeriod.from.toLocaleLowerCase() === day.toLocaleLowerCase();
};
