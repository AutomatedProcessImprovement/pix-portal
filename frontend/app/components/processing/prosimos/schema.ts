import * as yup from "yup";
import { DistributionType, getNumOfParamsPerDistr } from "./distribution";

const distributionSchema = {
  distribution_name: yup.string().required(),
  distribution_params: yup.mixed().when("distribution_name", (distributionName: string | string[], _) => {
    const dtype = distributionName as DistributionType;
    return yup
      .array()
      .of(
        yup.object().shape({
          value: yup.number().required(),
        })
      )
      .required()
      .min(getNumOfParamsPerDistr(dtype), `Missed required parameters for ${distributionName}`);
  }),
};

const calendarPeriod = yup.object({
  from: yup.string().required(),
  to: yup.string().required(),
  beginTime: yup.string().required(),
  endTime: yup.string().required(),
});

export const prosimosConfigurationSchema = yup.object({
  // total_casea and start_time have a soft requirement, they must be present when submitting data,
  // but can be omitted when loading data from custom parameters files
  total_cases: yup.number().positive().integer(),
  start_time: yup.date(),
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
          .min(1, "At least one resource is required")
          .test("unique", "Resource profiles must have globally unique names", (resourceList) => {
            const namesArr = resourceList?.map(({ name }) => name ?? "");
            return isStrArrUnique(namesArr);
          }),
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
          .test("sum", "Gateway branching probabilities must sum to 1", testProbabilitiesSum)
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
        .test("sum", "Batching probabilities of the size distribution array must sum to 1", testProbabilitiesSum)
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
            .test("unique", "Firing rules must have unique attributes", testUniqueAttributes)
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
                  .test("sum", "Case attributes values probabilities must sum to 1", testProbabilitiesSum);
              default:
                throw new Error(`Invalid type: ${type}`);
            }
          }),
        })
      ),
      prioritization_rules: yup.array().of(
        yup.object({
          priority_level: yup.number().required().min(1),
          rules: yup
            .array()
            .of(
              yup
                .array()
                .of(
                  yup.object({
                    attribute: yup.string().required(),
                    comparison: yup.string().required(),
                    value: yup
                      .mixed<
                        | yup.InferType<typeof prioritizationStringSchema>
                        | yup.InferType<typeof prioritizationNumbersSchema>
                      >()
                      .test("shape", "Invalid values", (value) => {
                        prioritizationStringSchema.isValidSync(value) || prioritizationNumbersSchema.isValidSync(value);
                      }),
                  })
                )
                .min(1)
                .test("unique", "Prioritization rules must have unique attributes", testUniqueAttributes)
            )
            .min(1),
        })
      ),
    })
  ),
});

const prioritizationStringSchema = yup.string().required();
const prioritizationNumbersSchema = yup
  .array()
  .of(yup.number())
  .required()
  .min(2, "At least two parameters are required");

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

function testUniqueAttributes(items: { attribute: string }[] | undefined) {
  if (!items) return true;
  const keysArr = items?.map(({ attribute }) => attribute ?? "");
  return isStrArrUnique(keysArr);
}

const isStrArrUnique = (values: string[] | undefined): boolean => {
  const arrLength = values?.length;
  if (!arrLength || arrLength === 0) return true;
  const set = new Set(values);
  return arrLength === set.size;
};
