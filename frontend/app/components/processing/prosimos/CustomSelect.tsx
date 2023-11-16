import React from "react";
import { useFormContext } from "react-hook-form";
import { InputError } from "./InputError";

export function CustomSelect({
  name,
  options,
  label,
  ...rest
}: { name: string; options: string[]; label?: string } & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>) {
  const { register, formState } = useFormContext();
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name}>{label || name}</label>
      <select {...register(name)} {...rest}>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {formState.errors && formState.errors[name] && (
        <InputError message={formState.errors[name]?.message?.toString()} />
      )}
    </div>
  );
}
