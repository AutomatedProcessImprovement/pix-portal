import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "../../../../components/Input";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import FormSection from "./FormSection";
import { DistributionType } from "./schema";

interface CaseAttribute {
  name: string;
  type: "continuous" | "discrete";
  values: { key: string; value: number }[];
}

export function TabCaseAttributes() {
  const name = "case_attributes";

  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  function handleAppend(type: CaseAttribute["type"]) {
    const fieldsIndex = watch(name).length;
    const attributeName = `Attribute Name ${fieldsIndex}`;
    switch (type) {
      case "continuous":
        append({ name: attributeName, type: type, values: [{ key: "Option Name 0", value: 1 }] });
        break;
      case "discrete":
        append({
          name: attributeName,
          type: type,
          values: [{ distribution_name: DistributionType.expon, distribution_params: [0, 0, 0] }],
        });
        break;
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Case Attributes">
        {fields.map((field, index) => {
          return (
            <CaseAttribute key={field.id} name={`${name}[${index}]`}>
              <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                Remove Attribute
              </button>
            </CaseAttribute>
          );
        })}
        <div className="flex space-x-2 justify-center">
          <button type="button" onClick={() => handleAppend("discrete")}>
            Add Discrete Case Attribute
          </button>
          <button type="button" onClick={() => handleAppend("continuous")}>
            Add Continuous Case Attribute
          </button>
        </div>
      </FormSection>
    </div>
  );
}

function CaseAttribute({ name, children }: { name: string; children?: React.ReactNode }) {
  const { control, watch } = useFormContext();

  const [caseType, setCaseType] = useState("discrete");
  useEffect(() => {
    const type = watch(`${name}.type`);
    setCaseType(type);
  }, [name, watch]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.values`,
  });

  return (
    <div className="border-4 p-4 space-y-2">
      <div className="space-y-2">
        <div className="flex flex-col border-4 p-4 space-y-4">
          <Input name={`${name}.name`} label="Attribute Name" />
          {caseType === "discrete" &&
            fields.map((field, index) => {
              return (
                <div key={field.id} className="flex flex-col space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      name={`${name}.values[${index}].key`}
                      defaultValue={"Option Name 0"}
                      type="text"
                      label="Option Name"
                    />
                    <Input name={`${name}.values[${index}].value`} defaultValue={1} step={0.01} type="number" label="Probability" />
                    <button type="button" onClick={() => remove(index)} className="bg-slate-400">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          <button
            type="button"
            onClick={() => {
              const fieldsLength = watch(`${name}.values`).length;
              append({ key: `Option Name ${fieldsLength}`, value: 1 });
            }}
          >
            Add Option
          </button>
          {caseType === "continuous" &&
            fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <DistributionNameAndValues name={`${name}.values[${index}]`} />
                </div>
              );
            })}
        </div>
      </div>
      {children}
    </div>
  );
}
