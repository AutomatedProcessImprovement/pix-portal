import { ErrorMessage } from "@hookform/error-message";
import React, { useId } from "react";
import { useFormContext } from "react-hook-form";

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
  const {
    register,
    formState: { errors },
  } = useFormContext();

  if (pure) {
    noError = true;
    noLabel = true;
    noWrapper = true;
  }

  const selectId = useId();

  const innerContent = (
    <>
      {!noLabel && <label htmlFor={selectId}>{label || name}</label>}
      <select id={selectId} {...register(name)} {...rest} className="truncate">
        {options.map((option, index) => (
                <option key={option} value={option}>
            {optionLabels ? optionLabels[index] : option}
          </option>
        ))}
      </select>
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => <p className="text-red-500 text-sm">{message}</p>}
      />
    </>
  );

  if (noWrapper) {
    return innerContent;
  } else {
    return <div className="flex flex-col space-y-1">{innerContent}</div>;
  }
}
