import React, { useContext, useEffect, useId, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BpmnDataContext } from "../contexts";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";

enum BatchingType {
  sequential = "Sequential",
  parallel = "Parallel",
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

  function handleAppend() {
    append({
      task_id: activities[0]?.id ?? "",
      type: BatchingType.sequential,
      size_distrib: [],
      duration_distrib: [],
      firing_rules: [],
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Batching">
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
          Add Activity Batching Rules
        </button>
      </FormSection>
    </div>
  );
}

function BatchingConfiguration({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch, setError } = useFormContext();

  // this field is controlled programmatically, so we don't need to register it or display in UI
  const { replace: replaceSizeField } = useFieldArray({
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

  function handleAppendDurationScaling() {
    const key = watch(`${name}.duration_distrib`).length + 1;
    appendDurationField({ key: key, value: 0 });
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

  // handling the size_distrib array that is computed based on the batching probability input field
  const batchingProbabilityInputId = useId();
  const [batchingProbability, setBatchingProbability] = useState<number>(1.0);
  useEffect(() => {
    if (isNaN(batchingProbability)) {
      setError(`${name}.batchingProbability`, { type: "manual", message: "Batching Probability must be a number" });
      return;
    }
    if (batchingProbability < 0 || batchingProbability > 1) {
      setError(`${name}.batchingProbability`, {
        type: "manual",
        message: "Batching Probability must be between 0 and 1",
      });
      return;
    }
    if (batchingProbability === 1) {
      replaceSizeField([{ key: 1, value: 1.0 }]);
    } else {
      replaceSizeField([
        { key: 1, value: parseFloat((1.0 - batchingProbability).toPrecision(2)) }, // to avoid precision errors we use toPrecision
        { key: 2, value: batchingProbability },
      ]);
    }
  }, [batchingProbability]);

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <div className="flex flex-col border-4 p-4 space-y-4">
          <span className="text-lg font-semibold">Acitivity Batches</span>
          <Select
            name={`${name}.task_id`}
            options={activities.map((activity) => activity.id)}
            optionLabels={activities.map((activity) => activity.name)}
            label="Activity Name"
          />
          <Select name={`${name}.type`} options={Object.values(BatchingType)} label="Batch Type" />
          {/* The Batching Probability input isn't present in the form schema but is used to compute batch_processing[0].size_distrib */}
          <label htmlFor={batchingProbabilityInputId}>Batching Probability</label>
          <input
            type="number" // type="number" uses comma as decimal separator (depending on the OS settings), but we need a dot
            id={batchingProbabilityInputId}
            value={batchingProbability}
            onChange={(e) => setBatchingProbability(parseFloat(e.target.value))}
            placeholder="From 0 to 1"
          />
          {durationFields.map((field, index) => {
            return (
              <div key={field.id} className="flex items-end p-4 border-4 space-x-2">
                <Input name={`${name}.duration_distrib[${index}].key`} label="Batch Size" />
                <Input name={`${name}.duration_distrib[${index}].value`} label="Duration Scale Factor" />
                <button type="button" onClick={() => removeDurationField(index)} className="w-28 bg-slate-400">
                  Remove
                </button>
              </div>
            );
          })}
          <button type="button" onClick={handleAppendDurationScaling}>
            Add Duration Scaling
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
