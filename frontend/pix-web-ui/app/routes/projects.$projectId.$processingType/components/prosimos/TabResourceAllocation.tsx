import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BpmnDataContext } from "../../contexts";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import FormSection from "./FormSection";
import { Select } from "./Select";
import { DistributionType } from "./schema";

export function TabResourceAllocation() {
  const name = "task_resource_distribution";

  const bpmnData = useContext(BpmnDataContext);

  const { control, watch } = useFormContext();

  // at least one resource calendar is required for this component to render
  const resourceProfiles = watch("resource_profiles");
  // track if the component is enabled
  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    if (!resourceProfiles) return;
    if (resourceProfiles.length > 0) setIsEnabled(true);
    else setIsEnabled(false);
  }, [resourceProfiles]);

  const { fields, append } = useFieldArray({
    control,
    name: name,
  });

  // set acvitivities from BPMN file
  const [activities, setActivities] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    setActivities(bpmnData?.tasks || []);

    console.log("activities", activities);

    // if there are no fields, add one for each activity
    if (fields.length === 0) {
      bpmnData?.tasks?.forEach((task) => {
        append({ task_id: task.id, resources: [] });
      });
    }
  }, [bpmnData, fields.length, append, activities]);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Resource Allocation">
        {!isEnabled && <div className="text-red-500">Please add resource profiles first</div>}
        {isEnabled &&
          fields.map((field, index) => {
            return (
              <div key={field.id}>
                <ResourceAllocation
                  name={`${name}[${index}]`}
                  activityName={activities[index]?.name}
                ></ResourceAllocation>
              </div>
            );
          })}
      </FormSection>
    </div>
  );
}

function ResourceAllocation({
  name,
  activityName,
  children,
}: {
  name: string;
  activityName?: string;
  children?: React.ReactNode;
}) {
  const { control, watch, getValues } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.resources`,
  });

  // at least one resource profile is required for this component to render,
  // resource profiles are taken from resource pools
  const resourcePools = watch("resource_profiles");
  /** Takes and flattens "resource_list" from all of the resource pools. */
  const extractProfilesFromPools = useCallback(() => {
    const profiles: any[] = [];
    Object.entries(resourcePools).reduce((acc, [key, value]) => {
      const pool = value as { resource_list: any[] };
      acc.push(...pool.resource_list);
      return acc;
    }, profiles);
    return profiles;
  }, [resourcePools]);
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
  }, [resourcePools, extractProfilesFromPools]);

  const handleAddResourceActivityDistribution = useCallback(() => {
    append({
      resource_id: resourceProfiles && resourceProfiles[0].name,
      distribution_name: DistributionType.expon,
      distribution_params: [0, 0, 0, 0],
    });
  }, [resourceProfiles, append]);

  // add one on render after resource profiles are loaded
  useEffect(() => {
    if (fields.length === 0 && resourceProfiles.length > 0) handleAddResourceActivityDistribution();
  }, [fields.length, resourceProfiles, handleAddResourceActivityDistribution]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  function onToggle() {
    setDetailsOpen(!detailsOpen);
  }

  return (
    <div className="border-4 space-y-2 group">
      {!isEnabled && <div className="p-2 text-red-500">Please add resource calendars first</div>}
      {isEnabled && (
        <details id={name} className="space-y-2" onToggle={onToggle}>
          <summary className="p-2 flex space-x-2 cursor-pointer group-hover:text-slate-600">
            {detailsOpen && <ChevronDownIcon className="w-8 text-slate-300 " />}
            {!detailsOpen && <ChevronRightIcon className="w-8 text-slate-300" />}
            <div className="flex flex-col">
              <p className="flex space-x-4">
                <span className="w-28">Activity Name:</span>
                <span className="font-semibold">{activityName}</span>
              </p>
              <p className="flex space-x-4">
                <span className="w-28">Activity ID:</span>
                <span>{getValues(`${name}.task_id`) || "not found"}</span>
              </p>
            </div>
          </summary>
          <div className="m-4 flex flex-col border-4 space-y-4">
            {fields.map((field, index) => {
              return (
                <div key={field.id} className="flex flex-col bg-slate-50 px-4 py-3 space-y-4">
                  <Select
                    name={`${name}.resources[${index}].resource_id`}
                    options={resourceProfiles.map((profile: any) => profile.name)}
                    defaultValue={resourceProfiles[0].name}
                    label="Resource Profile"
                  />
                  <DistributionNameAndValues name={`${name}.resources[${index}]`} />
                  <button type="button" onClick={() => remove(index)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <div className="p-4">
            <button type="button" onClick={handleAddResourceActivityDistribution}>
              Add Allocation
            </button>
          </div>
        </details>
      )}
      {children}
    </div>
  );
}
