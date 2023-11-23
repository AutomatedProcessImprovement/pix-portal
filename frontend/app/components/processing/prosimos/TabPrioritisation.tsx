import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";

export function TabPrioritisation() {
  const name = "prioritization_rules";

  const { control, watch } = useFormContext();

  // track if there are any discrete case attributes' options
  const caseAttributes = watch(`case_attributes`);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  useEffect(() => {
    if (!caseAttributes) return;
    setIsEnabled(caseAttributes.length > 0);
  }, [caseAttributes]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAppend() {
    append({
      priority_level: 1,
      rules: [],
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Case-Based Prioritisation">
        {!isEnabled && <div className="text-red-500">Please add case attributes first</div>}
        {isEnabled &&
          fields.map((field, index) => {
            return (
              <PrioritisationConfiguration key={field.id} name={`${name}[${index}]`}>
                <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                  Remove Rule
                </button>
              </PrioritisationConfiguration>
            );
          })}
        <button type="button" onClick={handleAppend} disabled={!isEnabled}>
          Add Rule
        </button>
      </FormSection>
    </div>
  );
}

function PrioritisationConfiguration({ name, children }: { name: string; children?: React.ReactNode }) {
  return (
    <div className="border-4 p-4 space-y-2">
      <Input name={`${name}.priority_level`} type="number" label="Priority Level" />
      <PrioritisationRules name={`${name}.rules`} />
      {children}
    </div>
  );
}

enum PrioritisationOperator {
  lessThanOrEqual = "<=",
  equal = "=",
  greaterThanOrEqual = ">=",
  between = "between",
}

function PrioritisationRules({ name }: { name: string }) {
  const { control } = useFormContext();

  const {
    fields: orFiringRulesFields,
    append: appendOrRulesField,
    remove: removeOrRulesField,
  } = useFieldArray({
    control,
    name: `${name}`,
  });

  return (
    <div className="flex flex-col border-4 p-4 space-y-4">
      <span className="text-lg font-semibold">Prioritisation Rules</span>
      <div className="border-4 p-4 flex flex-col space-y-4">
        <span className="text-lg font-semibold">OR Rules</span>
        {orFiringRulesFields.map((field, index) => {
          return (
            <PrioritisationAndRules key={field.id} name={`${name}[${index}]`}>
              <button type="button" onClick={() => removeOrRulesField(index)} className="bg-slate-400">
                Remove AND Rules
              </button>
            </PrioritisationAndRules>
          );
        })}
        <button type="button" onClick={() => appendOrRulesField({})}>
          Add AND Rules
        </button>
      </div>
    </div>
  );
}

function PrioritisationAndRules({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  // track if there are any discrete case attributes' options
  const [caseAttributesOptions, setCaseAttribtuesOptions] = React.useState<string[]>([]);
  const caseAttributes = watch(`case_attributes`);
  useEffect(() => {
    if (!caseAttributes) return;
    const discreteCaseAttributes = caseAttributes.filter((attribute: any) => attribute.type === "discrete");
    const options = discreteCaseAttributes.flatMap((attribute: any) => attribute.values.map((value: any) => value.key));
    setCaseAttribtuesOptions(options);
  }, [caseAttributes]);

  // track case attributes' names
  const [caseAttributesNames, setCaseAttributesNames] = React.useState<string[]>([]);
  useEffect(() => {
    if (!caseAttributes) return;
    const names = caseAttributes.map((attribute: any) => attribute.name);
    setCaseAttributesNames(names);
  }, [caseAttributes]);

  const {
    fields: andFiringRulesFields,
    append: appendAndRulesField,
    remove: removeAndRulesField,
  } = useFieldArray({
    control,
    name: `${name}`,
  });

  function getComparisonOptions(attribute: string) {
    const caseAttribute = caseAttributes.find((attr: any) => attr.name === attribute);
    if (!caseAttribute) return [""];
    return caseAttribute.type === "discrete" ? [PrioritisationOperator.equal] : Object.values(PrioritisationOperator);
  }

  return (
    <div className="border-4 p-4 space-y-4">
      <div className="flex flex-col space-y-4">
        <span className="text-lg font-semibold">AND Rules</span>
        {andFiringRulesFields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2">
              <Select name={`${name}[${index}].attribute`} options={caseAttributesNames} label="Attribute" />
              <Select
                name={`${name}[${index}].comparison`}
                options={getComparisonOptions(watch(`${name}[${index}].attribute`))}
                label="Operator"
              />
              <PrioritisationAndRulesValuesField name={`${name}[${index}]`} />
              <button type="button" onClick={() => removeAndRulesField(index)} className="bg-slate-400">
                Remove
              </button>
            </div>
          );
        })}
        <button type="button" onClick={() => appendAndRulesField({})}>
          Add Condition
        </button>
      </div>
      {children}
    </div>
  );
}

function PrioritisationAndRulesValuesField({ name }: { name: string }) {
  const { control, watch } = useFormContext();

  const caseAttributes = watch(`case_attributes`);
  const attributeName = watch(`${name}.attribute`);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.value`,
  });

  // add one input field by default
  useEffect(() => {
    const fieldsLength = watch(`${name}.value`).length;
    if (fieldsLength === 0) append({ value: 0 });
  }, []);

  const [attributeType, setAttributeType] = useState<string | undefined>(undefined);
  useEffect(() => {
    const caseAttribute = caseAttributes.find((attr: any) => attr.name === attributeName);
    if (!caseAttribute) return;
    setAttributeType(caseAttribute.type);
  }, [attributeName]);

  const attributeOperator = watch(`${name}.comparison`);
  useEffect(() => {
    // "between" for "continous" attribute requires two input fields, so remove one
    if (attributeType === "continuous" && attributeOperator === PrioritisationOperator.between) {
      append({ value: 1 });
    } else {
      // remove all input fields except the first one
      if (watch(`${name}.value`).length > 1) {
        for (let i = 1; i < watch(`${name}.value`).length; i++) {
          remove(i);
        }
      }
    }
  }, [attributeOperator]);

  function getCaseAttributeOptions(attribute: string) {
    const caseAttribute = caseAttributes.find((attr: any) => attr.name === attribute);
    if (!caseAttribute) return [""];
    return caseAttribute.values.map((value: any) => value.key as string);
  }

  return (
    <div className="flex space-x-2">
      {fields.map((field, index) => {
        const fieldName = `${name}.value[${index}]`;
        return (
          <div key={field.id}>
            {attributeType === "continuous" && <Input name={fieldName} type="number" label="Value" defaultValue={0} />}
            {attributeType === "discrete" && (
              <Select name={fieldName} options={getCaseAttributeOptions(attributeName)} label="Case Attribute Option" />
            )}
          </div>
        );
      })}
    </div>
  );
}
