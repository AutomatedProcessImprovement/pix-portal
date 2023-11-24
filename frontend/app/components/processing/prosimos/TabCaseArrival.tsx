import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";
import { WeekDay } from "./schema";

export function TabCaseArrival() {
  const name = "arrival_time_calendar";

  const { control } = useFormContext();

  function formatDateForInputValue(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hour = date.getHours();
    const minute = date.getMinutes();

    const monthString = month.toString().padStart(2, "0");
    const dayString = day.toString().padStart(2, "0");

    const hourString = hour.toString().padStart(2, "0");
    const minuteString = minute.toString().padStart(2, "0");

    return `${year}-${monthString}-${dayString}T${hourString}:${minuteString}`;
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAddTime() {
    append({
      from: "Monday",
      to: "Friday",
      beginTime: "09:00",
      endTime: "17:00",
    });
  }

  // append one on render
  useEffect(() => {
    if (fields.length === 0) handleAddTime();
  }, []);

  const weekDays = Object.values(WeekDay);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Scenario Specification">
        <Input name="total_cases" type="number" defaultValue={100} />
        <Input name="start_time" type="datetime-local" defaultValue={formatDateForInputValue(new Date())} />
        <DistributionNameAndValues name="arrival_time_distribution" />
      </FormSection>
      <FormSection title="Arrival Time Calendar">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2 items-end">
              <Select name={`${name}[${index}].from`} options={weekDays} label="From" />
              <Select name={`${name}[${index}].to`} options={weekDays} label="To" />
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
