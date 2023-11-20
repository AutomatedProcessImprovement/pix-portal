import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DistributionType } from "./distribution-constants";

export function TabCaseCreationDistributionParametersInputs({
  name,
  ...rest
}: {
  name: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { control, register, watch } = useFormContext();
  const watchDistributionName = watch("arrival_time_distribution.distribution_name", rest.defaultValue);

  const { fields, replace } = useFieldArray({
    control,
    name,
  });

  const labelNames = {
    [DistributionType.expon]: ["Mean (s)", "Min (s)", "Max (s)"],
    [DistributionType.uniform]: ["Min (s)", "Max (s)"],
    [DistributionType.fix]: ["Mean (s)"],
    [DistributionType.gamma]: ["Mean", "Variance (s)", "Min (s)", "Max (s)"],
    [DistributionType.lognorm]: ["Mean (s)", "Variance (s)", "Min (s)", "Max (s)"],
    [DistributionType.norm]: ["Mean (s)", "Std Dev (s)", "Min (s)", "Max (s)"],
  };

  useEffect(() => {
    // make sure we have the correct number of fields in the field array
    const numOfLabels = labelNames[watchDistributionName as keyof typeof labelNames].length;
    replace(
      Array.from({ length: numOfLabels }, () => {
        return { value: 0 };
      })
    );
  }, [watchDistributionName]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <label htmlFor={`${name}[${index}].value`}>
              {labelNames[watchDistributionName as keyof typeof labelNames][index]}
            </label>
            <input {...register(`${name}[${index}].value` as const)} {...rest} />
          </div>
        );
      })}
    </>
  );
}