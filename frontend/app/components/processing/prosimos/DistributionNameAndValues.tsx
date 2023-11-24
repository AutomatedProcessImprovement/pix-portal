import { DistributionParametersInputs } from "./DistributionParametersInputs";
import { Select } from "./Select";
import { DistributionType } from "./distribution";

export function DistributionNameAndValues({ name }: { name: string }) {
  return (
    <>
      <Select
        name={`${name}.distribution_name`}
        label="Distribution Type"
        options={Object.values(DistributionType)}
        defaultValue={DistributionType.expon}
      />
      <DistributionParametersInputs
        name={`${name}.distribution_params`}
        distributionNameKey={`${name}.distribution_name`}
        distributionParamsKey={`${name}.distribution_params`}
        defaultValue={DistributionType.expon}
      />
    </>
  );
}
