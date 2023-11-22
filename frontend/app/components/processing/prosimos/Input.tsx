import { ErrorMessage } from "@hookform/error-message";
import React from "react";
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

  const innerContent = (
    <>
      {!noLabel && <label htmlFor={name}>{label || name}</label>}
      <input id={name} {...register(name)} {...rest} className={`truncate ${rest.className ? rest.className : ""}`} />
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
