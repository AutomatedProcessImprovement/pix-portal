import { ErrorMessage } from "@hookform/error-message";
import React, { useId } from "react";
import { useFormContext } from "react-hook-form";

export function Input({
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
  const {
    register,
    formState: { errors },
  } = useFormContext();

  if (pure) {
    noError = true;
    noLabel = true;
    noWrapper = true;
  }

  const inputId = useId();

  const innerContent = (
    <>
      {!noLabel && <label htmlFor={inputId}>{label || name}</label>}
      <input
        id={inputId}
        {...register(name)}
        {...rest}
        className={`truncate ${rest.className ? rest.className : ""}`}
      />
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
