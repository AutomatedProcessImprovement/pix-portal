import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "../../../../components/Input";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import { FieldArrayRemoveIconButton } from "./FieldArrayRemoveIconButton";
import FormSection from "./FormSection";
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
        <div className="grid grid-cols-2 gap-2">
          <Input name="total_cases" label="Total Cases" type="number" defaultValue={100} />
          <Input name="start_time" type="datetime-local" label="Start Time" defaultValue={formatDate(new Date())} />
        </div>
        <DistributionNameAndValues name="arrival_time_distribution" />
      </FormSection>
      <FormSection title="Arrival Time Calendar">
        <div className="flex space-x-2">
          <span className="w-[23%]">From</span>
          <span className="w-[23%]">To</span>
          <span className="w-[23%]">Begin at</span>
          <span className="w-[23%]">End at</span>
          <span className="w-[8%]"></span>
        </div>
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2">
              <Select
                name={`${name}[${index}].from`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="From"
                pure={true}
                className="w-[23%]"
              />
              <Select
                name={`${name}[${index}].to`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="To"
                pure={true}
                className="w-[23%]"
              />
              <Input
                name={`${name}[${index}].beginTime`}
                type="time"
                defaultValue="09:00:00"
                step="1"
                label="Begin at"
                pure={true}
                className="w-[23%]"
              />
              <Input
                name={`${name}[${index}].endTime`}
                type="time"
                defaultValue="17:00:00"
                step="1"
                label="End at"
                pure={true}
                className="w-[23%]"
              />
              <div className="flex w-[8%]">
                <FieldArrayRemoveIconButton onClick={() => remove(index)} />
              </div>
            </div>
          );
        })}
        <div className="flex justify-center">
          <button className="mt-4 w-1/3" type="button" onClick={handleAddTime}>
            Add Time
          </button>
        </div>
      </FormSection>
    </div>
  );
}
