import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Select } from "./Select";

export function TabPrioritisation() {
  const name = "prioritization_rules";

  const { control, watch } = useFormContext();

  // track if there are any discrete case attributes' options
  const caseAttributes = watch(`case_attributes`);
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  useEffect(() => {
    if (!caseAttributes) return;
    const discreteCaseAttributes = caseAttributes.filter((attribute: any) => attribute.type === "discrete");
    if (discreteCaseAttributes.length > 0) {
      setIsEnabled(true);
    }
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
      <FormSection title="Prioritisation">
        {!isEnabled && <div className="text-red-500">Please add resource profiles first</div>}
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

enum PrioritisationRuleAttribute {
  name = "name",
}

enum PrioritisationOperator {
  equal = "=",
}

function prioritisationRuleAttributeToLabel(attribute: PrioritisationRuleAttribute) {
  switch (attribute) {
    case PrioritisationRuleAttribute.name: {
      return "Name";
    }
    default: {
      return attribute;
    }
  }
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
                options={Object.values(PrioritisationRuleAttribute)}
                optionLabels={Object.values(PrioritisationRuleAttribute).map((attribute) =>
                  prioritisationRuleAttributeToLabel(attribute)
                )}
                label="Attribute"
              />
              <Select
                name={`${name}[${index}].comparison`}
                options={Object.values(PrioritisationOperator)}
                label="Operator"
              />
              <Select name={`${name}[${index}].values`} options={caseAttributesOptions} label="Case Attribute Option" />
              <button type="button" onClick={() => removeAndRulesField(index)} className="bg-slate-400">
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            appendAndRulesField({
              attribute: PrioritisationRuleAttribute.name,
              comparison: PrioritisationOperator.equal,
              value: caseAttributesOptions.length > 0 ? caseAttributesOptions[0] : "",
            })
          }
        >
          Add Condition
        </button>
      </div>
      {children}
    </div>
  );
}
