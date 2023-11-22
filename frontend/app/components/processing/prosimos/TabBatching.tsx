import React, { useContext, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BpmnDataContext } from "../contexts";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";

enum BatchingType {
  sequential = "Sequential",
  parallel = "Parallel",
  concurrent = "Concurrent",
}

export function TabBatching() {
  const name = "batch_processing";

  const { control } = useFormContext();

  const {
    fields: batchingRulesFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: name,
  });

  function handleAppend() {
    append({
      // task_id is there, but we don't provide the default value,
      // the Select will receive the first task_id form the BPMN data
      // task_id: "",
      type: BatchingType.sequential,
      size_distrib: [],
      duration_distrib: [],
      firing_rules: [],
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Resource Allocation">
        {batchingRulesFields.map((field, index) => {
          return (
            <BatchingConfiguration key={field.id} name={`${name}[${index}]`}>
              <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                Remove Batching Rule
              </button>
            </BatchingConfiguration>
          );
        })}
        <button type="button" onClick={handleAppend}>
          Add Activity Batching Ruleset
        </button>
      </FormSection>
    </div>
  );
}

function BatchingConfiguration({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  const {
    fields: sizeFields,
    append: appendSizeField,
    remove: removeSizeField,
  } = useFieldArray({
    control,
    name: `${name}.size_distrib`,
  });

  const {
    fields: durationFields,
    append: appendDurationField,
    remove: removeDurationField,
  } = useFieldArray({
    control,
    name: `${name}.duration_distrib`,
  });

  function handleAppend() {
    const key = watch(`${name}.size_distrib`).length;
    appendSizeField({ key: key, value: 0 });
    appendDurationField({ key: key, value: 0 });
  }

  function handleRemove(index: number) {
    removeSizeField(index);
    removeDurationField(index);
  }

  // set acvitivities from BPMN file
  const bpmnData = useContext(BpmnDataContext);
  const [activities, setActivities] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (bpmnData === null) return;
    const activities = bpmnData?.tasks?.map((task) => {
      return {
        id: task.id,
        name: task.name,
      };
    });
    setActivities(activities);
  }, [bpmnData]);

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <div className="flex flex-col border-4 p-4 space-y-4">
          <span className="text-lg font-semibold">Acitivity Batches</span>
          <Select
            name={`${name}.task_id`}
            options={activities.map((activity) => activity.name)}
            label="Activity Name"
            defaultValue={activities.length > 0 ? activities[0].name : ""}
          />
          <Select name={`${name}.type`} options={Object.values(BatchingType)} label="Batch Type" />
          {sizeFields.map((field, index) => {
            // sizeFields and duraionFields must have the same length, they elements are paired,
            // so we use only sizeFields to fille values of both fields
            return (
              <div key={field.id} className="flex items-end p-4 border-4 space-x-2">
                <Input name={`${name}.size_distrib[${index}].value`} label="Batch Size" />
                <Input name={`${name}.duration_distrib[${index}].value`} label="Duration Scale Factor" />
                <button type="button" onClick={() => handleRemove(index)} className="w-28 bg-slate-400">
                  Remove Batch
                </button>
              </div>
            );
          })}
          <button type="button" onClick={handleAppend}>
            Add Batch
          </button>
        </div>
      </div>
      <FiringOrRules name={`${name}`} />
      {children}
    </div>
  );
}

enum FiringRuleAttribute {
  batch_size = "batch_size",
  time_since_first = "time_since_first",
  time_since_last = "time_since_last",
  day_hour = "daily_hour",
  week_day = "week_day",
}

type FiringAndRule = {
  attribute: FiringRuleAttribute;
  comparison: string;
  value: number;
};

const defaultFiringAndRule: FiringAndRule = {
  attribute: FiringRuleAttribute.batch_size,
  comparison: ">",
  value: 0,
};

function firingRuleAttributeToLabel(attribute: FiringRuleAttribute) {
  switch (attribute) {
    case FiringRuleAttribute.batch_size:
      return "Batch Size";
    case FiringRuleAttribute.time_since_first:
      return "Time Since First";
    case FiringRuleAttribute.time_since_last:
      return "Time Since Last";
    case FiringRuleAttribute.day_hour:
      return "Hour of the Day";
    case FiringRuleAttribute.week_day:
      return "Day of the Week";
  }
}

function FiringOrRules({ name }: { name: string }) {
  const { control } = useFormContext();

  const {
    fields: orFiringRulesFields,
    append: appendOrRulesField,
    remove: removeOrRulesField,
  } = useFieldArray({
    control,
    name: `${name}.firing_rules`,
  });

  return (
    <div className="flex flex-col border-4 p-4 space-y-4">
      <span className="text-lg font-semibold">Firing Rules</span>
      <div className="border-4 p-4 flex flex-col space-y-4">
        <span className="text-lg font-semibold">OR Rules</span>
        {orFiringRulesFields.map((field, index) => {
          return (
            <FiringAndRules key={field.id} name={`${name}.firing_rules[${index}]`}>
              <button type="button" onClick={() => removeOrRulesField(index)} className="bg-slate-400">
                Remove AND Rules
              </button>
            </FiringAndRules>
          );
        })}
        <button type="button" onClick={() => appendOrRulesField({})}>
          Add AND Rules
        </button>
      </div>
    </div>
  );
}

function FiringAndRules({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control } = useFormContext();

  const {
    fields: andFiringRulesFields,
    append: appendAndRulesField,
    remove: removeAndRulesField,
  } = useFieldArray({
    control,
    name: `${name}`,
  });

  return (
    <div className="border-4 p-4 space-y-4">
      <div className="flex flex-col space-y-4">
        <span className="text-lg font-semibold">AND Rules</span>
        {andFiringRulesFields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2">
              <Select
                name={`${name}[${index}].attribute`}
                options={Object.values(FiringRuleAttribute)}
                optionLabels={Object.values(FiringRuleAttribute).map((attribute) =>
                  firingRuleAttributeToLabel(attribute)
                )}
                label="Attribute"
              />
              <Select
                name={`${name}[${index}].comparison`}
                options={["<", "<=", "=", ">=", ">", "in", "null"]}
                label="Operator"
              />
              <Input name={`${name}[${index}].value`} label="Value" />
              <button type="button" onClick={() => removeAndRulesField(index)} className="bg-slate-400">
                Remove
              </button>
            </div>
          );
        })}
        <button type="button" onClick={() => appendAndRulesField(defaultFiringAndRule)}>
          Add Condition
        </button>
      </div>
      {children}
    </div>
  );
}
