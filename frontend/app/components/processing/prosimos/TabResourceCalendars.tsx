import React, { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";
import { weekDays } from "./schema";
import { makeTitleCase } from "./shared";

export function TabResourceCalendars() {
  const name = "resource_calendars";

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAddCalendar() {
    const id = fields.length + 1;
    append({ id: `${id}`, name: `calendar ${id}`, time_periods: [] });
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Resource Calendars">
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <ResourceCalendar name={`${name}[${index}]`}>
                <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                  Remove Calendar
                </button>
              </ResourceCalendar>
            </div>
          );
        })}
        <button type="button" onClick={handleAddCalendar}>
          Add Calendar
        </button>
      </FormSection>
    </div>
  );
}

function ResourceCalendar({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.time_periods`,
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

  const weekDays_: string[] = weekDays.map((day) => day.toUpperCase());
  const weekDaysLabels = useMemo(() => weekDays_.map((day) => makeTitleCase(day)), [weekDays_]);

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <Input name={`${name}.name`} label="Calendar Name" />
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2">
              <Select
                name={`${name}.time_periods.[${index}].from`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="From"
                pure={true}
              />
              <Select
                name={`${name}.time_periods.[${index}].to`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="To"
                pure={true}
              />
              <Input
                name={`${name}.time_periods.[${index}].beginTime`}
                type="time"
                defaultValue="09:00"
                label="Begin at"
                pure={true}
              />
              <Input
                name={`${name}.time_periods.[${index}].endTime`}
                type="time"
                defaultValue="17:00"
                label="End at"
                pure={true}
              />
              <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                Remove
              </button>
            </div>
          );
        })}
        <button type="button" onClick={handleAddTime}>
          Add time
        </button>
      </div>
      {children}
    </div>
  );
}
