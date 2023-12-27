import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "./Input";
import { distributionParameters } from "./schema";

export function DistributionParametersInputs({
  name,
  // watchDistributionName is a key to distribution name element,
  // e.g. "arrival_time_distribution.distribution_name"
  // or "task_resource_distribution[$[index1]].resources[${index}2].distribution_name"
  distributionNameKey,
  distributionParamsKey,
  ...rest
}: {
  name: string;
  distributionNameKey: string;
  distributionParamsKey: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { control, watch, getValues } = useFormContext();

  const { fields, replace } = useFieldArray({
    control,
    name,
  });

  const [labels, setLabels] = React.useState<string[]>([]);
  const distributionName = watch(distributionNameKey);
  useEffect(() => {
    setLabels(distributionParameters[distributionName as keyof typeof distributionParameters]);
  }, [distributionName]);

  useEffect(() => {
    if (!labels || labels.length === 0) return;
    const distributionParams = getValues(distributionParamsKey);
    if (distributionParams) {
      // if values are provided, use them
      replace(
        Array.from({ length: labels.length }, (_, index) => {
          return { value: distributionParams[index]?.value || 0 };
        })
      );
    } else {
      // otherwise, use default values
      replace(
        Array.from({ length: labels.length }, () => {
          return { value: 0 };
        })
      );
    }
  }, [labels, distributionParamsKey, getValues, replace]);

  return (
    <div className={`grid grid-cols-2 gap-2`}>
      {fields.map((field, index) => {
        return <Input key={field.id} name={`${name}[${index}].value`} type="number" step="any" label={labels[index]} />;
      })}
    </div>
  );
}
