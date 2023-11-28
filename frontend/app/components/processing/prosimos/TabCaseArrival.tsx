import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";
import { weekDays } from "./schema";
import { formatDate, makeTitleCase } from "./shared";

export function TabCaseArrival() {
  const name = "arrival_time_calendar";

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const handleAddTime = useCallback(() => {
    append({
      from: "Monday",
      to: "Friday",
      beginTime: "09:00",
      endTime: "17:00",
    });
  }, [append]);

  // append one on render
  useEffect(() => {
    if (fields.length === 0) handleAddTime();
  }, [fields.length, handleAddTime]);

  const weekDays_ = weekDays.map((day) => day.toUpperCase());
  const weekDaysLabels = useMemo(() => weekDays_.map((day) => makeTitleCase(day)), [weekDays_]);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Scenario Specification">
        <Input name="total_cases" type="number" defaultValue={100} />
        <Input name="start_time" type="datetime-local" defaultValue={formatDate(new Date())} />
        <DistributionNameAndValues name="arrival_time_distribution" />
      </FormSection>
      <FormSection title="Arrival Time Calendar">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2 items-end">
              <Select name={`${name}[${index}].from`} options={weekDays_} optionLabels={weekDaysLabels} label="From" />
              <Select name={`${name}[${index}].to`} options={weekDays_} optionLabels={weekDaysLabels} label="To" />
              <Input
                name={`${name}[${index}].beginTime`}
                type="time"
                defaultValue="09:00:00"
                step="1"
                label="Begin at"
              />
              <Input name={`${name}[${index}].endTime`} type="time" defaultValue="17:00:00" step="1" label="End at" />
              <div>
                <button type="button" onClick={() => remove(index)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={handleAddTime}>
          Add Calendar
        </button>
      </FormSection>
    </div>
  );
}
