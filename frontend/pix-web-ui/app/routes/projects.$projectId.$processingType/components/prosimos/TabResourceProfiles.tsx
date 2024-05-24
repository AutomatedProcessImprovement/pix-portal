import React, { useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Select } from "~/routes/projects.$projectId.$processingType/components/prosimos/Select";
import { Input } from "../../../../components/Input";
import FormSection from "./FormSection";

export function TabResourceProfiles() {
  const name = "resource_profiles";

  const { control, watch } = useFormContext();

  // at least one resource calendar is required for this component to render
  const resourceCalendars = watch("resource_calendars");

  // track if the component is enabled
  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    if (!resourceCalendars) return;
    if (resourceCalendars.length > 0) setIsEnabled(true);
    else setIsEnabled(false);
  }, [resourceCalendars]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAddPool() {
    const id = fields.length + 1;
    const name = `pool ${id}`;
    append({ id: name, name: name, resource_list: [] });
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Resource Profiles">
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
      </FormSection>
    </div>
  );
}

function ResourceProfile({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.resource_list`,
  });

  const handleAddTime = useCallback(() => {
    const id = fields.length + 1;
    const name = `profile ${id}`;
    append({
      id: name,
      name: name,
      cost_per_hour: 0,
      amount: 1,
    });
  }, [append, fields.length]);

  // append one on render
  useEffect(() => {
    if (fields.length === 0) handleAddTime();
  }, [fields.length, handleAddTime]);

  const resourceCalendars = watch("resource_calendars");

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <Input name={`${name}.name`} label="Pool Name" />
        <div className="flex flex-col space-y-2">
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
                <Input name={`${namePrefix}.name`} label="Name" pure={true} />
                <Input name={`${namePrefix}.cost_per_hour`} label="Name" type="number" pure={true} />
                <Input name={`${namePrefix}.amount`} label="Name" type="number" pure={true} />
                <Select
                  name={`${namePrefix}.calendar`}
                  options={resourceCalendars.map((c: any) => c.id)}
                  optionLabels={resourceCalendars.map((c: any) => c.name)}
                  defaultValue={resourceCalendars[0].id}
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
