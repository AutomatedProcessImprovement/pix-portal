import * as yup from "yup";
import { DistributionType, getNumOfParamsPerDistr } from "./distribution-constants";

const distributionValidation = {
  distribution_name: yup.string().required(),
  distribution_params: yup.mixed().when("distribution_name", (distr_name, _) => {
    const valueDistr = distr_name as DistributionType;
    return valueArray.min(getNumOfParamsPerDistr(valueDistr), `Missed required parameters for ${distr_name}`);
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

export const arrivalTimeSchema = yup.object().shape(distributionValidation);

export const caseCreationSchema = yup.object({
  total_cases: yup.number().positive().integer().required(),
  start_time: yup.date().required(),
  arrival_time_distribution: yup.object().shape(distributionValidation),
});
