import { createContext, useContext } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { SimParams } from "~/shared/optimos_json_type";

export const SimParamFormContext = createContext<UseFormReturn<SimParams, any, undefined> | undefined>(undefined);
export const SimParamFormProvider = SimParamFormContext.Provider;
export const SimParamFormConsumer = SimParamFormContext.Consumer;

export const useSimParamsForm = () => {
  const context = useContext(SimParamFormContext);
  if (context === undefined) {
    throw new Error("useSimParamsForm must be used within a SimParamFormProvider");
  }
  return context;
};

export const useSimParamsWorkTimes = (resourceId: string, day?: string) => {
  const form = useSimParamsForm();
  const calendars = useWatch({ control: form.control, name: `resource_calendars` });
  const workTimes = calendars.find((calendar) => calendar.id === resourceId)?.time_periods;
  if (day) {
    return workTimes?.filter((time) => time.from.toLocaleLowerCase() === day.toLocaleLowerCase());
  } else {
    return workTimes;
  }
};
