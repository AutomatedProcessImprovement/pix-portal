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
  gateway_branching_probabilities: yup
    .array()
    .of(
      yup.object({
        gateway_id: yup.string().required(),
        probabilities: yup
          .array()
          .of(
            yup.object({
              path_id: yup.string().required(),
              value: yup.number().max(1).required(),
            })
          )
          .test("sum", "Probabilities must sum to 1", testProbabilitiesSum)
          .required(),
      })
    )
    .required(),
  event_distribution: yup.array().of(
    // TODO: where is it coming from?
    yup.object({
      event_id: yup.string().required(),
      ...distributionSchema,
    })
  ),
  batch_processing: yup.array().of(
    yup.object({
      task_id: yup.string().required(),
      type: yup.string().required(),
      size_distrib: yup
        .array()
        .of(
          yup.object({
            key: yup.string().required(),
            value: yup.number().required(),
          })
        )
        .min(1)
        .test("sum", "Probabilities must sum to 1", testProbabilitiesSum)
        .test("unique", "Size distributions must have unique keys", testUniqueKeys),
      duration_distrib: yup
        .array()
        .of(
          yup.object({
            key: yup.string().required(),
            value: yup.number().required(),
          })
        )
        .min(1)
        .test("sum", "Probabilities must sum to 1", testProbabilitiesSum)
        .test("unique", "Duration distributions must have unique keys", testUniqueKeys),
      firing_rules: yup
        .array()
        .of(
          yup
            .array()
            .of(
              yup.object({
                attribute: yup.string().required(),
                comparison: yup.string().required(),
                // string for weekday and numeric string for all others
                value: yup.lazy((value) => {
                  const stringOrNumber = yup.string().when("attribute", {
                    is: (val: string) => val === "week_day",
                    // string is the only limitation (it can contain everything)
                    then: (schema) => schema,
                    // string can contain only digit numbers
                    otherwise: (schema) => schema.matches(/^\d+$/),
                  });
                  const oneValueSchema = stringOrNumber.required();
                  return Array.isArray(value) ? yup.array().of(oneValueSchema).min(2) : oneValueSchema;
                }),
              })
            )
            .min(1)
            .test("unique", "Firing rules must have unique attributes", (firingRules) => {
              if (!firingRules) return true;

              const attributeArr = firingRules?.map(({ attribute }) => attribute ?? "");
              const originalSize = attributeArr?.length;

              if (!originalSize || originalSize === 0) return true;

              const attributeSet = new Set(attributeArr);
              const uniqueSize = attributeSet.size;

              return uniqueSize === originalSize;
            })
        )
        .min(1),
      case_attributes: yup.array().of(
        yup.object({
          name: yup
            .string()
            .trim()
            .matches(
              /^[a-zA-Z0-9-_,.`':]+$/g,
              "Invalid name. Allowed characters include [a-z], [A-Z], [0-9], and [_,.-:`']"
            )
            .required(),
          type: yup.string().required(),
          values: yup.mixed().when("type", (type: string | string[], _) => {
            switch (type) {
              case "continuous":
                return yup.object().shape(distributionSchema);
              case "discrete":
                return yup
                  .array()
                  .of(
                    yup.object({
                      key: yup.string().required(),
                      value: yup.number().required(),
                    })
                  )
                  .min(1)
                  .test("sum", "Probabilities must sum to 1", testProbabilitiesSum);
              default:
                throw new Error(`Invalid type: ${type}`);
            }
          }),
        })
      ),
    })
  ),
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

function testProbabilitiesSum(value: any) {
  if (!value) {
    return true;
  }
  const sum = value.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0);
  return sum === 1;
}

function testUniqueKeys(items: { key: string }[] | undefined) {
  if (!items) return true;
  const keysArr = items?.map(({ key }) => key ?? "");
  return isStrArrUnique(keysArr);
}
