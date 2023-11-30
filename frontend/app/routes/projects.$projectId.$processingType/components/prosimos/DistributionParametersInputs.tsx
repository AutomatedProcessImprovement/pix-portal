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
  const watchDistributionName = watch(distributionNameKey, rest.defaultValue);

  const { fields, replace } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    // make sure we have the correct number of fields in the field array
    const numOfLabels = distributionParameters[watchDistributionName as keyof typeof distributionParameters].length;
    let params = getValues(distributionParamsKey);
    if (params && params.length > 1) {
      // if values are provided, use them
      replace(params.slice(0, numOfLabels));
    } else {
      // otherwise, use default values
      replace(
        Array.from({ length: numOfLabels }, () => {
          return { value: 0 };
        })
      );
    }
  }, [watchDistributionName, distributionParamsKey, getValues, replace]);

  return (
    <div className={`grid grid-cols-${fields.length} gap-2`}>
      {fields.map((field, index) => {
        return (
          <Input
            key={field.id}
            name={`${name}[${index}].value`}
            type="number"
            step="any"
            label={distributionParameters[watchDistributionName as keyof typeof distributionParameters][index]}
          />
        );
      })}
    </div>
  );
}
