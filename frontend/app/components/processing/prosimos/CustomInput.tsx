import React from "react";
import { useFormContext } from "react-hook-form";
import { InputError } from "./InputError";

export function CustomInput({
  name,
  label,
  ...rest
}: { name: string; label?: string } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  const { register, formState } = useFormContext();
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name}>{label || name}</label>
      <input {...register(name)} {...rest} />
      {formState.errors && formState.errors[name] && (
        <InputError message={formState.errors[name]?.message?.toString()} />
      )}
    </div>
  );
}
