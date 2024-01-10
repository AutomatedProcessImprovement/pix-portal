import React, { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "../../../../components/Input";
import { FieldArrayRemoveButton } from "./FieldArrayRemoveButton";
import { FieldArrayRemoveIconButton } from "./FieldArrayRemoveIconButton";
import FormSection from "./FormSection";
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
            <ResourceCalendar key={field.id} name={`${name}[${index}]`}>
              <FieldArrayRemoveButton label="Remove Calendar" onClick={() => remove(index)} />
            </ResourceCalendar>
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
    <div className="p-4 bg-slate-100 rounded-2xl space-y-2">
      <div className="space-y-2 flex flex-col">
        <div className="mb-4 flex items-end space-x-4">
          <Input className="w-2/3" name={`${name}.name`} label="Calendar Name" />
          <div className="">{children}</div>
        </div>
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
                name={`${name}.time_periods.[${index}].from`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="From"
                pure={true}
                className="w-[23%]"
              />
              <Select
                name={`${name}.time_periods.[${index}].to`}
                options={weekDays_}
                optionLabels={weekDaysLabels}
                label="To"
                pure={true}
                className="w-[23%]"
              />
              <Input
                name={`${name}.time_periods.[${index}].beginTime`}
                type="time"
                defaultValue="09:00"
                step="1"
                label="Begin at"
                pure={true}
                className="w-[23%]"
              />
              <Input
                name={`${name}.time_periods.[${index}].endTime`}
                type="time"
                defaultValue="17:00"
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
            Add time
          </button>
        </div>
      </div>
    </div>
  );
}
