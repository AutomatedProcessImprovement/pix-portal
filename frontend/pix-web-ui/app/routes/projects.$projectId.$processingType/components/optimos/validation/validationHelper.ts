/* eslint-disable no-fallthrough */
/* eslint-disable no-duplicate-case */
// flat error object

import type { FieldErrors, FieldPath, GlobalError, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { MasterFormData } from "../hooks/useMasterFormData";
import type { DAYS } from "../helpers";
import { isTimePeriodInDay, isTimePeriodInHour, selectionIndexesToBitmask } from "../helpers";
import type { ResourceCalendar, TimePeriod } from "~/shared/optimos_json_type";
import { getOverlappingHours } from "./validationFunctions";

// e.g {a: {b: {c: {message: 'error'}}}} => {'a.b.c': {message: 'error'}}
export const flattenErrors = (errors: FieldErrors<MasterFormData>) => {
  const result: Partial<Record<FieldPath<MasterFormData>, GlobalError>> = {};

  const recurse = (obj: any, path: string) => {
    for (const key in obj) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key]["message"] === undefined) {
        recurse(obj[key], newPath);
      } else {
        result[newPath as FieldPath<MasterFormData>] = obj[key];
      }
    }
  };

  recurse(errors, "");

  return result;
};

export type AutoFix = {
  title: string;
  action: (getValues: UseFormGetValues<MasterFormData>, setValue: UseFormSetValue<MasterFormData>) => void;
};

export type ParsedError = {
  humanReadablePath: string;
  message: string;
  path: string;
  link: string;
  humanReadableFieldName: string;
  autoFixes: AutoFix[];
};

export const convertError = (error: FieldErrors<MasterFormData>, formData: MasterFormData) => {
  const flattedError = flattenErrors(error);

  return Object.entries(flattedError)
    .map(([path, value]) => {
      const pathArray = path.split(".");
      const prefix = pathArray.slice(0, 2).join(".");

      if (!value) return null;
      switch (prefix) {
        case "constraints.resources":
          const resourceIndex = pathArray[2];
          const resource = formData.constraints?.resources[parseInt(resourceIndex)].id;

          const field = pathArray.slice(3, 5).join(".");

          switch (field) {
            case "constraints.never_work_masks":
            case "constraints.always_work_masks":
              const day = pathArray[5];
              const humanReadableFieldName =
                field === "constraints.never_work_masks" ? "Never Work Times" : "Always Work Times";
              return {
                humanReadablePath: `Resource Constraints > ${resource} > ${humanReadableFieldName} > ${day}`,
                message: value.message,
                path,
                link: "/projects.%24projectId.%24processingType/components/optimos",
                humanReadableFieldName,
                autoFixes: createQuickFixes(path, formData),
              };
            default:
              return null;
          }

        default:
          return null;
      }
    })
    .filter((x) => x !== null) as ParsedError[];
};

const createQuickFixes = (path: string, formData: MasterFormData): AutoFix[] => {
  const pathArray = path.split(".");
  const prefix = pathArray.slice(0, 2).join(".");
  const resourceIndex = parseInt(pathArray[2]);
  const resourceId = formData.constraints?.resources[resourceIndex].id;

  const field = pathArray.slice(3, 5).join(".");

  switch (field) {
    case "constraints.never_work_masks":
      return [
        {
          title: "Remove from Timetable",
          action: (get, set) => {
            const day = pathArray[5] as (typeof DAYS)[number];
            const calendars = get("simulationParameters.resource_calendars");
            const simParamsCalendarIndex = calendars.findIndex((calendar) => calendar.id === resourceId);
            const timePeriods = calendars[simParamsCalendarIndex]?.time_periods ?? [];
            const neverWorkMasks = get(path as any);
            const overlappingHours = getOverlappingHours(day, neverWorkMasks, timePeriods);
            const newTimePeriods = removeManyFromTimetable(day, overlappingHours, timePeriods);
            set(`simulationParameters.resource_calendars.${simParamsCalendarIndex}.time_periods`, newTimePeriods);
          },
        },
        {
          title: "Remove from Never-Work",
          action: (get, set) => {
            const day = pathArray[5] as (typeof DAYS)[number];
            const calendars = get("simulationParameters.resource_calendars");
            const simParamsCalendarIndex = calendars.findIndex((calendar) => calendar.id === resourceId);
            const timePeriods = calendars[simParamsCalendarIndex]?.time_periods ?? [];
            const neverWorkMasks = get(path as any);
            const overlappingHours = getOverlappingHours(day, neverWorkMasks, timePeriods);
            const overlappingHoursMask = selectionIndexesToBitmask(overlappingHours);
            const newNeverWorkMasks = neverWorkMasks & ~overlappingHoursMask;

            set(path as any, newNeverWorkMasks);
          },
        },
      ];
    case "constraints.always_work_masks":
      return [
        {
          title: "Remove from Never-Work",
          action: (get, set) => {
            const day = pathArray[5] as (typeof DAYS)[number];
            const neverWorkMasks = get(`constraints.resources.${resourceIndex}.constraints.never_work_masks.${day}`);
            const alwaysWorkMasks = get(path as any);
            const newNeverWorkMask = neverWorkMasks & ~alwaysWorkMasks;

            set(`constraints.resources.${resourceIndex}.constraints.never_work_masks.${day}`, newNeverWorkMask);
          },
        },
        {
          title: "Remove from Always-Work",
          action: (get, set) => {
            const day = pathArray[5] as (typeof DAYS)[number];
            const alwaysWorkMasks = get(path as any);
            const neverWorkMasks = get(`constraints.resources.${resourceIndex}.constraints.never_work_masks.${day}`);
            const newAlwaysWorkMasks = alwaysWorkMasks & ~neverWorkMasks;

            set(path as any, newAlwaysWorkMasks);
          },
        },
      ];

    default:
      return [];
  }
};

export const removeManyFromTimetable = (day: string, hours: number[], timePeriods: TimePeriod[]) => {
  let updatedTimePeriods = timePeriods;

  for (const hour of hours) {
    updatedTimePeriods = removeTimeFromTimetable(day, hour, updatedTimePeriods);
  }
  return updatedTimePeriods;
};

// Removes a time from the timetable of a resource
// This means, that we need to split/shorten the time periods that are containg the hour
// (e.g. if we remove 10:00 from 9:00-12:00, we need to split it into 9:00-10:00 and 11:00-12:00,
// if we remove 10:00 from 10:00-11:00, we need to remove the whole time period
// if we remove 10:00 from 08:00-10:00;10:00-12:00, we need to shorten the first to 08:00-09:00,
// and the second to 11:00-12:00)
export const removeTimeFromTimetable = (day: string, hour: number, timePeriods: TimePeriod[]) => {
  const updatedTimePeriods: TimePeriod[] = [];

  for (const period of timePeriods) {
    if (!isTimePeriodInDay(period, day)) {
      updatedTimePeriods.push(period);
      continue;
    }

    const c = (beginTime: string, endTime: string) => ({ ...period, beginTime, endTime });
    let { beginTime, endTime } = period;
    const [startHour, endHour] = [beginTime, endTime].map((time) => parseInt(time.split(":")[0]));
    const nextHour = hour + 1;
    const p = (t: number) => t.toString().padStart(2, "0");

    if (startHour === hour && endHour === nextHour) {
      continue;
    } else if (startHour < hour && endHour > nextHour) {
      updatedTimePeriods.push(c(beginTime, `${p(hour)}:00`));
      updatedTimePeriods.push(c(`${p(nextHour)}:00`, endTime));
    } else if (startHour === hour) {
      updatedTimePeriods.push(c(`${p(nextHour)}:00`, endTime));
    } else if (endHour === nextHour) {
      updatedTimePeriods.push(c(beginTime, `${p(hour)}:00`));
    } else {
      updatedTimePeriods.push(period);
    }
  }

  return updatedTimePeriods;
};
