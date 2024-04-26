import type { FieldErrors, Resolver, Validate } from "react-hook-form";
import type { ConsParams, ConstraintWorkMask, SimParams, TimePeriod } from "~/shared/optimos_json_type";
import { DAYS, bitmaskToSelectionIndexes, timePeriodToBinary, timePeriodsToBinary } from "../helpers";
import type { MasterFormData } from "../hooks/useMasterFormData";

export const getOverlappingHours = (day: (typeof DAYS)[number], mask: number, work_times: TimePeriod[]) => {
  const workHours = timePeriodsToBinary(work_times, day);

  return bitmaskToSelectionIndexes(mask & workHours);
};

export const createValidateNeverWorkMask =
  (resourceIndex: number, day: (typeof DAYS)[number]) => (mask: number, masterForm: MasterFormData) => {
    const work_times = masterForm.simulationParameters!.resource_calendars[resourceIndex].time_periods;

    if (!work_times) return "Resource not found";

    const overlapping_hours = getOverlappingHours(day, mask, work_times);

    if (overlapping_hours.length > 0) {
      return "Resource is working during these hours.";
    }

    return true;
  };

export const createValidateAlwaysWorkMask =
  (resourceIndex: number, day: (typeof DAYS)[number]) => (mask: number, masterForm: MasterFormData) => {
    const never_work_masks = masterForm.constraints!.resources[resourceIndex].constraints.never_work_masks[day];

    if (!never_work_masks) return true;

    if ((mask & never_work_masks) !== 0) {
      return "There is a conflict with the never work hours.";
    }

    return true;
  };

export const constraintResolver: Resolver<MasterFormData, any> = (values) => {
  const constraints = values.constraints;
  const resources = constraints?.resources;
  const resource_calendars = values.simulationParameters?.resource_calendars;

  if (!resources || !resource_calendars) return { errors: {}, values };

  const errors: FieldErrors<MasterFormData> = {};

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const globalConstraints = resource.constraints.global_constraints;
    let sumOfTimeTableHours = 0;
    let sumOfAlwaysWorkHours = 0;

    const time_periods =
      resource_calendars.find((resource_calendar) => resource_calendar.id === resource.id)?.time_periods ?? [];

    // Validate never_work_masks and always_work_masks
    const never_work_masks = resource.constraints.never_work_masks;
    const always_work_masks = resource.constraints.always_work_masks;

    for (const day of DAYS) {
      const never_work_mask = never_work_masks[day];
      const always_work_mask = always_work_masks[day];

      const sumOfTimeTableHoursDaily = timePeriodsToBinary(time_periods, day).toString(2).split("1").length - 1;
      const sumOfAlwaysWorkHoursDaily = always_work_mask.toString(2).split("1").length - 1;

      if (sumOfTimeTableHoursDaily > globalConstraints.max_daily_cap) {
        errors.constraints ??= {};
        errors.constraints.resources ??= [];
        errors.constraints.resources[i] ??= {};
        errors.constraints.resources[i]!.constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints!.max_daily_cap = {
          type: "validate",
          message: `Daily Capacity exceeded by time table hours ${sumOfTimeTableHoursDaily}h`,
        };
      }
      if (sumOfAlwaysWorkHoursDaily > globalConstraints.max_daily_cap) {
        errors.constraints ??= {};
        errors.constraints.resources ??= [];
        errors.constraints.resources[i] ??= {};
        errors.constraints.resources[i]!.constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints!.max_daily_cap = {
          type: "validate",
          message: `Daily Capacity exceeded by always work hours ${sumOfAlwaysWorkHoursDaily}h`,
        };
      }
      if (sumOfTimeTableHoursDaily > globalConstraints.max_shifts_day) {
        errors.constraints ??= {};
        errors.constraints.resources ??= [];
        errors.constraints.resources[i] ??= {};
        errors.constraints.resources[i]!.constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints!.max_shifts_day = {
          type: "validate",
          message: `Daily Capacity exceeded by time table hours (${sumOfTimeTableHoursDaily}h)`,
        };
      }
      if (sumOfAlwaysWorkHoursDaily > globalConstraints.max_shifts_day) {
        errors.constraints ??= {};
        errors.constraints.resources ??= [];
        errors.constraints.resources[i] ??= {};
        errors.constraints.resources[i]!.constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
        errors.constraints.resources[i]!.constraints!.global_constraints!.max_shifts_day = {
          type: "validate",
          message: `Daily Capacity exceeded by always work hours (${sumOfAlwaysWorkHoursDaily}h)`,
        };
      }

      sumOfTimeTableHours += sumOfTimeTableHoursDaily;
      sumOfAlwaysWorkHours += sumOfAlwaysWorkHoursDaily;

      if (never_work_mask) {
        const validateNeverWorkMask = createValidateNeverWorkMask(i, day);
        const result = validateNeverWorkMask(never_work_mask, values);
        if (result !== true) {
          errors.constraints ??= {};
          errors.constraints.resources ??= [];
          errors.constraints.resources[i] ??= {};
          errors.constraints.resources[i]!.constraints ??= {};
          errors.constraints.resources[i]!.constraints!.never_work_masks ??= {};
          errors.constraints.resources[i]!.constraints!.never_work_masks![day] = {
            type: "validate",
            message: result,
          };
        }
      }

      if (always_work_mask) {
        const validateAlwaysWorkMask = createValidateAlwaysWorkMask(i, day);
        const result = validateAlwaysWorkMask(always_work_mask, values);
        if (result !== true) {
          errors.constraints ??= {};
          errors.constraints.resources ??= [];
          errors.constraints.resources[i] ??= {};
          errors.constraints.resources[i]!.constraints ??= {};
          errors.constraints.resources[i]!.constraints!.always_work_masks ??= {};
          errors.constraints.resources[i]!.constraints!.always_work_masks![day] = {
            type: "validate",
            message: result,
          };
        }
      }
    }
    if (sumOfTimeTableHours > globalConstraints.max_weekly_cap) {
      errors.constraints ??= {};
      errors.constraints.resources ??= [];
      errors.constraints.resources[i] ??= {};
      errors.constraints.resources[i]!.constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints!.max_weekly_cap = {
        type: "validate",
        message: `Weekly Capacity exceeded by time table hours (${sumOfTimeTableHours}h)`,
      };
    }

    if (sumOfAlwaysWorkHours > globalConstraints.max_weekly_cap) {
      errors.constraints ??= {};
      errors.constraints.resources ??= [];
      errors.constraints.resources[i] ??= {};
      errors.constraints.resources[i]!.constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints!.max_weekly_cap = {
        type: "validate",
        message: `Weekly Capacity exceeded by always work hours (${sumOfAlwaysWorkHours}h)`,
      };
    }
    if (sumOfTimeTableHours > globalConstraints.max_shifts_week) {
      errors.constraints ??= {};
      errors.constraints.resources ??= [];
      errors.constraints.resources[i] ??= {};
      errors.constraints.resources[i]!.constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints!.max_shifts_week = {
        type: "validate",
        message: `Weekly Capacity exceeded by time table (${sumOfTimeTableHours}h)`,
      };
    }

    if (sumOfAlwaysWorkHours > globalConstraints.max_shifts_week) {
      errors.constraints ??= {};
      errors.constraints.resources ??= [];
      errors.constraints.resources[i] ??= {};
      errors.constraints.resources[i]!.constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints ??= {};
      errors.constraints.resources[i]!.constraints!.global_constraints!.max_shifts_week = {
        type: "validate",
        message: `Weekly Capacity exceeded by always work hours (${sumOfAlwaysWorkHours}h)`,
      };
    }
  }

  return { errors, values };
};
