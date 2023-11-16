import * as yup from "yup";
import { DistributionType, getNumOfParamsPerDistr } from "./distribution-constants";

const distributionValues = {
  distribution_name: yup.string().required(),
  distribution_params: yup.mixed().when("distribution_name", (distributionName: string | string[], _) => {
    const dtype = distributionName as DistributionType;
    return valueArray.min(getNumOfParamsPerDistr(dtype), `Missed required parameters for ${distributionName}`);
  }),
};

const valueArray = yup
  .array()
  .of(
    yup.object().shape({
      value: yup.number().required(),
    })
  )
  .required();

export const arrivalTimeSchema = yup.object().shape(distributionValues);

const calendarPeriod = yup.object({
  from: yup.string().required(),
  to: yup.string().required(),
  beginTime: yup.string().required(),
  endTime: yup.string().required(),
});

export const prosimosConfigurationSchema = yup.object({
  total_cases: yup.number().positive().integer().required(),
  start_time: yup.date().required(),
  arrival_time_distribution: yup.object().shape(distributionValues),
  arrival_time_calendar: yup.array().of(calendarPeriod).required().min(1, "At least one arrival calendar is required"),
  resource_calendars: yup
    .array()
    .of(
      yup.object({
        // NOTE: this field is removed from the form but added in the post-processing
        id: yup.string().required(),
        name: yup.string().required(),
        time_periods: yup.array().of(calendarPeriod).required(),
      })
    )
    .required(),
  resource_profiles: yup
    .array()
    .of(
      yup.object({
        // NOTE: this field is removed from the form but added in the post-processing
        id: yup.string().required(),
        name: yup.string().required(),
        resource_list: yup
          .array()
          .of(
            yup.object({
              // NOTE: this field is removed from the form but added in the post-processing
              id: yup.string().required(),
              name: yup.string().required(),
              cost_per_hour: yup.number().required(),
              amount: yup.number().positive().integer().required(),
              calendar: yup.string().required(),
              assignedTasks: yup.array(),
            })
          )
          .min(1, "At least one resource is required"),
      })
    )
    .min(1, "At least one resource profile is required"),
});

export enum WeekDay {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}
