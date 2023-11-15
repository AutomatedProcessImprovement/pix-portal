import React from "react";
import { useForm } from "react-hook-form";
import { CustomFormErrors } from "./CustomFormErrors";

export function CustomForm({
  defaultValues,
  children,
  onSubmit,
  className,
  resolver,
}: {
  defaultValues: any;
  children: any;
  onSubmit: any;
  className: string;
  resolver?: any;
}) {
  const methods = useForm({ defaultValues, resolver });
  const { handleSubmit } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {React.Children.map(children, (child) => {
        return child.props.name
          ? React.createElement(child.type, {
              ...{
                ...child.props,
                register: methods.register,
                key: child.props.name,
                errors: methods.formState.errors,
                getValues: methods.getValues,
                watch: methods.watch,
                control: methods.control,
              },
            })
          : child;
      })}
      {methods.formState.errors && <CustomFormErrors errors={methods.formState.errors} />}
    </form>
  );
}
