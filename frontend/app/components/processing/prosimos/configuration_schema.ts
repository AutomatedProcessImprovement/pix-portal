import * as yup from "yup";
import { DistributionType, getNumOfParamsPerDistr } from "./distribution";

const validateArrayUniqueness = (ref: any, fieldName: string, message: string) => {
  return ref.test("unique", message, function (this: any, distrArr: []) {
    return validateArrayUniquenessTest(this, distrArr, fieldName, message);
  });
};

const validateArrayUniquenessTest = (ref: any, distrArr: [], fieldName: string, message: string) => {
  const keysArr = distrArr?.map(({ [fieldName]: value }) => value ?? "");
  const { path, createError } = ref;

  return isStrArrUnique(keysArr) || createError({ path, message });
};

const isStrArrUnique = (wordsArr: string[] | undefined): boolean => {
  // returns whether the provided array of string contains only unique words
  const origSize = wordsArr?.length;

  if (!origSize || origSize === 0) {
    return true;
  }

  const set = new Set(wordsArr);
  const uniqueSize = set.size;

  return uniqueSize === origSize;
};

yup.addMethod(yup.array, "uniqueId", validateArrayUniqueness); // TODO: continue with this

const distributionSchema = {
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

export const arrivalTimeSchema = yup.object().shape(distributionSchema);

const calendarPeriod = yup.object({
  from: yup.string().required(),
  to: yup.string().required(),
  beginTime: yup.string().required(),
  endTime: yup.string().required(),
});

export const prosimosConfigurationSchema = yup.object({
  total_cases: yup.number().positive().integer().required(),
  start_time: yup.date().required(),
  arrival_time_distribution: yup.object().shape(distributionSchema),
  arrival_time_calendar: yup.array().of(calendarPeriod).required().min(1, "At least one arrival calendar is required"),
  resource_calendars: yup
    .array()
    .of(
      yup.object({
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
        id: yup.string().required(),
        name: yup.string().required(),
        resource_list: yup
          .array()
          .of(
            yup.object({
              id: yup.string().required(), // TODO: this ID should be globally unique
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
  task_resource_distribution: yup
    .array()
    .of(
      yup.object({
        task_id: yup.string().required(),
        resources: yup
          .array()
          .of(
            yup.object({
              resource_id: yup.string().required(),
              ...distributionSchema,
            })
          )
          .required()
          .min(1, "At least one resource profile in the resource allocation is required"),
      })
    )
    .required()
    .min(1, "At least one resource allocation is required"),
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
