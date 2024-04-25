import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ConsParams } from "~/shared/optimos_json_type";

type ValidationTabProps = {
  constraintsForm: UseFormReturn<ConsParams, object>;
};
export const ValidationTab: FC<ValidationTabProps> = (props) => {
  return (
    <div>
      <h1>Validation Tab</h1>
    </div>
  );
};
