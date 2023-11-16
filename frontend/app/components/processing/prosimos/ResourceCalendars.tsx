import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomFormSection from "./CustomFormSection";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "./CustomSelect";
import { WeekDay } from "./form-schema";

export function ResourceCalendars() {
  const name = "resource_calendars";

  const { control, watch } = useFormContext();
  const selectedResourceCalendarName = watch(`${name}.name`);
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  useEffect(() => {
    console.log("selectedResourceCalendarName", selectedResourceCalendarName);
  }, [selectedResourceCalendarName]);

  return (
    <div className="flex flex-col space-y-4">
      <CustomFormSection title="Resource Calendars">
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
        <button
          type="button"
          onClick={() =>
            append({ id: `${fields.length}`, name: "default schedule " + fields.length, time_periods: [] })
          }
        >
          Add Calendar
        </button>
      </CustomFormSection>
    </div>
  );
}

function ResourceCalendar({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.time_periods`,
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
    handleAddTime();
  }, []);

  const weekDays = Object.values(WeekDay);

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <input type="hidden" {...control.register(`${name}.id`)} />
        <CustomInput name={`${name}.name`} label="Name" />
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2">
              <CustomSelect name={`${name}.time_periods.[${index}].from`} options={weekDays} label="From" pure={true} />
              <CustomSelect name={`${name}.time_periods.[${index}].to`} options={weekDays} label="To" pure={true} />
              <CustomInput
                name={`${name}.time_periods.[${index}].beginTime`}
                type="time"
                defaultValue="09:00"
                label="Begin at"
                pure={true}
              />
              <CustomInput
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
