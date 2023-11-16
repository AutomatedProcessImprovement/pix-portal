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

export const prosimosConfigurationSchema = yup.object({
  total_cases: yup.number().positive().integer().required(),
  start_time: yup.date().required(),
  arrival_time_distribution: yup.object().shape(distributionValues),
  arrival_time_calendar: yup
    .array()
    .of(
      yup.object({
        from: yup.string().required(),
        to: yup.string().required(),
        beginTime: yup.string().required(),
        endTime: yup.string().required(),
      })
    )
    .required()
    .min(1, "At least one calendar is required"),
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
