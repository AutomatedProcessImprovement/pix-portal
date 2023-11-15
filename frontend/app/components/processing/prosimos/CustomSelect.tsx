import React from "react";
import { FieldErrors } from "react-hook-form";
import { InputError } from "./InputError";

export function CustomSelect({
  register,
  options,
  name,
  errors,
  ...rest
}: { register?: any; options: string[]; name: string; errors?: FieldErrors } & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name}>{name}</label>
      <select {...register(name)} {...rest}>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {errors && errors[name] && <InputError message={errors[name]?.message?.toString()} />}
    </div>
  );
}
