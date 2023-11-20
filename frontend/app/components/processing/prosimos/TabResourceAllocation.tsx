import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";
import { DistributionType } from "./distribution-constants";

//  "task_resource_distribution": [
//         {
//             "task_id": "node_f38b9a97-7fe1-4930-acbd-db874a206caf",
//             "resources": [
//                 {
//                     "resource_id": "Alberto Duport",
//                     "distribution_name": "gamma",
//                     "distribution_params": [
//                         {
//                             "value": 107.8381235189874
//                         },
//                         {
//                             "value": 29152.338380398352
//                         },
//                         {
//                             "value": 0.0
//                         },
//                         {
//                             "value": 860.08685
//                         }
//                     ]
//                 },
//           }
//   ]

// TODO: read BPMN activities to display task_id in the component

export function TabResourceAllocation() {
  const name = "task_resource_distribution";

  const { control, watch } = useFormContext();

  // at least one resource calendar is required for this component to render
  const resourceProfiles = watch("resource_profiles");
  // track if the component is enabled
  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    if (resourceProfiles.length > 0) setIsEnabled(true);
    else setIsEnabled(false);
  }, [resourceProfiles]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAddAllocation() {
    append({ task_id: "Foo bar", resources: [] });
  }
  useEffect(() => {
    if (fields.length === 0) handleAddAllocation();
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Resource Allocation">
        {!isEnabled && <div className="text-red-500">Please add resource profiles first</div>}
        {isEnabled &&
          fields.map((field, index) => {
            return (
              <div key={field.id}>
                <ResourceAllocation name={`${name}[${index}]`}></ResourceAllocation>
              </div>
            );
          })}
      </FormSection>
    </div>
  );
}

function ResourceAllocation({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.resources`,
  });

  // at least one resource profile is required for this component to render,
  // resource profiles are taken from resource pools
  const resourcePools = watch("resource_profiles");
  const [resourceProfiles, setResourceProfiles] = useState<any[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    if (resourcePools.length > 0) {
      setIsEnabled(true);
      const profiles = extractProfilesFromPools();
      setResourceProfiles(profiles);
    } else {
      setIsEnabled(false);
    }
  }, [resourcePools]);

  /** Takes and flattens "resource_list" from all of the resource pools. */
  function extractProfilesFromPools() {
    const profiles: any[] = [];
    Object.entries(resourcePools).reduce((acc, [key, value]) => {
      const pool = value as { resource_list: any[] };
      acc.push(...pool.resource_list);
      return acc;
    }, profiles);
    return profiles;
  }

  // add one on render after resource profiles are loaded
  useEffect(() => {
    if (fields.length === 0 && resourceProfiles.length > 0) handleAddResourceActivityDistribution();
  }, [resourceProfiles]);

  function handleAddResourceActivityDistribution() {
    append({
      resource_id: resourceProfiles && resourceProfiles[0].name,
      distribution_name: DistributionType.expon,
      distribution_params: [0, 0, 0, 0],
    });
  }

  return (
    <div className="border-4 p-4 space-y-2">
      {!isEnabled && <div className="text-red-500">Please add resource calendars first</div>}
      {isEnabled && (
        <div className="space-y-2">
          <Input name={`${name}.task_id`} label="Activity Name" disabled={true} />
          <div className="flex flex-col border-4 p-4 space-y-4">
            {fields.map((field, index) => {
              return (
                <div key={field.id} className="bg-slate-50 px-4 py-3">
                  <Select
                    name={`${name}.resources[${index}].resource_id`}
                    options={resourceProfiles.map((profile: any) => profile.name)}
                    defaultValue={resourceProfiles[0].name}
                    label="Resource Profile"
                  />
                  <Select
                    name={`${name}.resources[${index}].distribution_name`}
                    options={Object.values(DistributionType)}
                    defaultValue={DistributionType.expon}
                  />
                  <DistributionParametersInputs
                    name={`${name}.resources[${index}].distribution_params`}
                    watchDistributionName={`${name}.resources[${index}].distribution_name`}
                    defaultValue={DistributionType.expon}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={handleAddResourceActivityDistribution}>
            Add Allocation
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

export function DistributionParametersInputs({
  name,
  // watchDistributionName is a key to distribution name element,
  // e.g. "arrival_time_distribution.distribution_name"
  // or "task_resource_distribution[$[index1]].resources[${index}2].distribution_name"
  watchDistributionName,
  ...rest
}: {
  name: string;
  watchDistributionName: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { control, register, watch } = useFormContext();
  const watchDistributionName_ = watch(watchDistributionName, rest.defaultValue);

  const { fields, replace } = useFieldArray({
    control,
    name,
  });

  const labelNames = {
    [DistributionType.expon]: ["Mean (s)", "Min (s)", "Max (s)"],
    [DistributionType.uniform]: ["Min (s)", "Max (s)"],
    [DistributionType.fix]: ["Mean (s)"],
    [DistributionType.gamma]: ["Mean", "Variance (s)", "Min (s)", "Max (s)"],
    [DistributionType.lognorm]: ["Mean (s)", "Variance (s)", "Min (s)", "Max (s)"],
    [DistributionType.norm]: ["Mean (s)", "Std Dev (s)", "Min (s)", "Max (s)"],
  };

  useEffect(() => {
    // make sure we have the correct number of fields in the field array
    const numOfLabels = labelNames[watchDistributionName_ as keyof typeof labelNames].length;
    replace(
      Array.from({ length: numOfLabels }, () => {
        return { value: 0 };
      })
    );
  }, [watchDistributionName_]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <label htmlFor={`${name}[${index}].value`}>
              {labelNames[watchDistributionName_ as keyof typeof labelNames][index]}
            </label>
            <input {...register(`${name}[${index}].value` as const)} {...rest} />
          </div>
        );
      })}
    </>
  );
}