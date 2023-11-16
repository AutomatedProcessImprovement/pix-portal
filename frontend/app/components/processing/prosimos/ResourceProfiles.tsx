import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomFormSection from "./CustomFormSection";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "~/components/processing/prosimos/CustomSelect";

export function ResourceProfiles() {
  const name = "resource_profiles";

  const { control, watch } = useFormContext();

  // at least one resource calendar is required for this component to render
  const resourceCalendars = watch("resource_calendars");

  // track if the component is enabled
  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    if (resourceCalendars.length > 0) setIsEnabled(true);
    else setIsEnabled(false);
  }, [resourceCalendars]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAddPool() {
    const id = fields.length + 1;
    append({ id: `${id}`, name: `pool ${id}`, resource_list: [] });
  }

  // append one on render
  // useEffect(() => {
  //   if (fields.length === 0) handleAddPool();
  // }, []);

  return (
    <div className="flex flex-col space-y-4">
      <CustomFormSection title="Resource Calendars">
        {!isEnabled && <div className="text-red-500">Please add resource calendars first</div>}
        {isEnabled &&
          fields.map((field, index) => {
            return (
              <div key={field.id}>
                <ResourceProfile name={`${name}[${index}]`}>
                  <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                    Remove Pool
                  </button>
                </ResourceProfile>
              </div>
            );
          })}
        <button type="button" onClick={handleAddPool} disabled={!isEnabled}>
          Add Pool
        </button>
      </CustomFormSection>
    </div>
  );
}

function ResourceProfile({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.resource_list`,
  });

  function handleAddTime() {
    const id = fields.length + 1;
    append({
      id: `${id}`,
      name: `profile ${id}`,
      cost_per_hour: 0,
      amount: 1,
    });
  }

  // append one on render
  useEffect(() => {
    if (fields.length === 0) handleAddTime();
  }, []);

  const resourceCalendars = watch("resource_calendars");

  useEffect(() => {
    console.log("resourceCalendars", resourceCalendars);
  }, [resourceCalendars]);

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <CustomInput name={`${name}.name`} label="Pool Name" />
        <div className="flex flex-col space-y-2 ptt-4">
          <div className="grid grid-cols-5 gap-2">
            <div>Profile Name</div>
            <div>Cost per hour</div>
            <div>Amount</div>
            <div>Calendar</div>
            <div></div>
          </div>
          {fields.map((field, index) => {
            const namePrefix = `${name}.resource_list.[${index}]`;
            return (
              <div key={field.id} className="grid grid-cols-5 gap-2">
                <CustomInput name={`${namePrefix}.name`} label="Name" pure={true} />
                <CustomInput name={`${namePrefix}.cost_per_hour`} label="Name" type="number" pure={true} />
                <CustomInput name={`${namePrefix}.amount`} label="Name" type="number" pure={true} />
                <CustomSelect
                  name={`${namePrefix}.calendar`}
                  options={resourceCalendars.map((c: any) => c.name)}
                  defaultValue={resourceCalendars[0].name}
                  pure={true}
                />
                <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={handleAddTime}>
          Add time
        </button>
      </div>
      {children}
    </div>
  );
}
