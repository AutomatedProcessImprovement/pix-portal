import React from "react";
import { useFormContext } from "react-hook-form";
import { InputError } from "./InputError";

export function CustomInput({
  name,
  label,
  noLabel,
  noError,
  noWrapper,
  pure,
  ...rest
}: {
  name: string;
  label?: string;
  noLabel?: boolean;
  noError?: boolean;
  noWrapper?: boolean;
  pure?: boolean;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { register, formState } = useFormContext();

  if (pure) {
    noError = true;
    noLabel = true;
    noWrapper = true;
  }

  const innerContent = (
    <>
      {!noLabel && <label htmlFor={name}>{label || name}</label>}
      <input id={name} {...register(name)} {...rest} />
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
