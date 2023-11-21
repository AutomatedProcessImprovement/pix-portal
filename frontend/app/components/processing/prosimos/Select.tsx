import React from "react";
import { useFormContext } from "react-hook-form";
import { InputError } from "./InputError";

export function Select({
  name,
  options,
  optionLabels,
  label,
  noLabel,
  noError,
  noWrapper,
  pure,
  ...rest
}: {
  name: string;
  options: string[];
  optionLabels?: string[];
  label?: string;
  noLabel?: boolean;
  noError?: boolean;
  noWrapper?: boolean;
  pure?: boolean;
} & React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) {
  const { register, formState } = useFormContext();

  if (pure) {
    noError = true;
    noLabel = true;
    noWrapper = true;
  }

  const innerContent = (
    <>
      {!noLabel && <label htmlFor={name}>{label || name}</label>}
      <select id={name} {...register(name)} {...rest} className="truncate">
        {options.map((option, index) => (
          <option key={option} value={option}>
            {optionLabels ? optionLabels[index] : option}
          </option>
        ))}
      </select>
      {!noError && formState.errors && formState.errors[name] && (
        <InputError message={formState.errors[name]?.message?.toString()} />
      )}
    </>
  );

  if (noWrapper) {
    return innerContent;
  } else {
    return <div className="flex flex-col space-y-1">{innerContent}</div>;
  }
}
