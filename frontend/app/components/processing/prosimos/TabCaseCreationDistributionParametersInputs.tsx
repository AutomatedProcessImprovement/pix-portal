import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "./Input";
import { DistributionType } from "./distribution";

export function TabCaseCreationDistributionParametersInputs({
  name,
  ...rest
}: {
  name: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { control, watch, getValues } = useFormContext();
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
    let params = getValues("arrival_time_distribution.distribution_params");
    console.log("params", params);
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
  }, [watchDistributionName]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <Input
              name={`${name}[${index}].value`}
              type="number"
              label={labelNames[watchDistributionName as keyof typeof labelNames][index]}
            />
          </div>
        );
      })}
    </>
  );
}
