import { DistributionParametersInputs } from "./DistributionParametersInputs";
import { Select } from "./Select";
import { DistributionType } from "./schema";

export function DistributionNameAndValues({ name }: { name: string }) {
  return (
    <div className="flex flex-col space-y-2">
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
    </div>
  );
}
