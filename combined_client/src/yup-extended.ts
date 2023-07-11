import * as yup from "yup";
import { AnyObject, Maybe } from "yup/lib/types";
import moment from "moment";
import { REQUIRED_ERROR_MSG, SHOULD_BE_NUMBER_MSG, UNIQUE_KEYS } from "./components/prosimos/validationMessages";
import { DISTR_FUNC, getNumOfParamsPerDistr } from "./components/prosimos/distributions/constants";

const isStrArrUnique = (wordsArr: string[] | undefined): boolean => {
  // returns whether the provided array of string contains only unique words
  const origSize = wordsArr?.length

  if (!origSize || origSize === 0) {
    return true
  }

  const set = new Set(wordsArr)
  const uniqueSize = set.size

  return uniqueSize === origSize
}

yup.addMethod<yup.StringSchema>(yup.string, "timeFormat", function (errorMessage) {
  return this.test("test-time-format", errorMessage, function (value) {
    const { path, createError } = this;

    return (
      moment(value, "HH:mm:ss.SSSSSS", true).isValid() ||
      moment(value, "HH:mm:ss.SSS", true).isValid() ||
      moment(value, "HH:mm:ss", true).isValid() ||
      createError({ path, message: errorMessage })
    );
  });
});

yup.addMethod<yup.StringSchema>(yup.string, "integer", function () {
  return this.matches(/^\d+$/, "Only digits are allowed")
})

const validateArrayUniquenessTest = (ref: any, distrArr: [], fieldName: string, message: string) => {
  const keysArr = distrArr?.map(({ [fieldName]: value }) => value ?? "")
  const { path, createError } = ref;

  return (
    isStrArrUnique(keysArr) ||
    createError({ path, message })
  )
}

const validateArrayUniqueness = (ref: any, fieldName: string, message: string) => {
  return ref.test(
    "unique",
    message,
    function (this: any, distrArr: []) {
      return validateArrayUniquenessTest(this, distrArr, fieldName, message)
    });
};

// quarantees that AND rule doesn't have duplicated attributes (e.g., two weekdays)
yup.addMethod(yup.array, "uniqueAttributes", function () { return validateArrayUniqueness(this, "attribute", "Fields should be unique") });

// quarantees that we have only one setup per task
yup.addMethod(yup.array, "uniqueTaskBatching", function () { return validateArrayUniqueness(this, "task_id", "Only one batch setup per task is allowed") });

// quarantees the uniqueness of keys per distribution map
yup.addMethod(yup.array, "uniqueKeyDistr", function () { return validateArrayUniqueness(this, "key", UNIQUE_KEYS("Keys")) });

// quarantees the uniqueness of priority levels per distribution map
yup.addMethod(yup.array, "uniquePriorityLevel", function () { return validateArrayUniqueness(this, "priority_level", UNIQUE_KEYS("Priority levels")) });

// quarantees the uniqueness of "id" property per array
yup.addMethod(yup.array, "uniqueId", function () { return validateArrayUniqueness(this, "id", UNIQUE_KEYS("Id properties")) });

const valueArray = yup.array()
  .of(
    yup.object().shape({
      value: yup.number().typeError(SHOULD_BE_NUMBER_MSG).required(REQUIRED_ERROR_MSG)
    })
  )
  .required()

export const distributionValidation = {
  distribution_name: yup.string().required(REQUIRED_ERROR_MSG),
  distribution_params: yup.mixed().when('distribution_name', (distr_name, schema) => {
    const valueDistr = distr_name as DISTR_FUNC
    return valueArray.min(getNumOfParamsPerDistr(valueDistr), `Missed required parameters for ${distr_name}`)
  })
}

const stringSchema = yup.string()
const numArraySchema = yup.array()
  .of(
    yup.number()
  )
  .required()
  .min(2, "At least two required parameters should be provided")

export const stringOrNumberArr = yup.mixed<yup.InferType<typeof stringSchema> | yup.InferType<typeof numArraySchema>>()
  .test("shape", "invalid", (data) => (stringSchema.isValidSync(data) || numArraySchema.isValidSync(data)));

declare module "yup" {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
    > extends yup.BaseSchema<TType, TContext, TOut> {
    timeFormat(errorMessage: string): StringSchema<TType, TContext>;
    integer(): StringSchema<TType, TContext>;
  }

  interface ArraySchema<T> {
    uniqueAttributes(): ArraySchema<T>;
    uniqueTaskBatching(): ArraySchema<T>;
    uniqueKeyDistr(): ArraySchema<T>;
    uniquePriorityLevel(): ArraySchema<T>;
    uniqueId(): ArraySchema<T>;
  }
}

export default yup;
