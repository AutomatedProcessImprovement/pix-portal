import React from "react";
import { FieldErrors } from "react-hook-form";
import { InputError } from "./InputError";

export function CustomInput({
  register,
  name,
  errors,
  ...rest
}: { register?: any; name: string; errors?: FieldErrors } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name}>{name}</label>
      <input {...register(name)} {...rest} />
      {errors && errors[name] && <InputError message={errors[name]?.message?.toString()} />}
    </div>
  );
}
