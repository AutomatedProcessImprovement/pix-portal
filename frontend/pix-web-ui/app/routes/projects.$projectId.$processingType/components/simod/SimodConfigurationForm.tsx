import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import Form from "@rjsf/core";
import type { IconButtonProps, RJSFSchema, SubmitButtonProps } from "@rjsf/utils";
import * as rjsfUtils from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { createRef, useState } from "react";
import schema from "./simod_configuration_schema.json";

const { getSubmitButtonOptions } = rjsfUtils;

// More on JSON Schema: https://json-schema.org/learn/getting-started-step-by-step
const formSchema = schema as RJSFSchema;

export function SimodConfigurationForm() {
  const [formData, setFormData] = useState(null);
  const formRef = createRef<Form>();

  // See https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-templates
  // for more information on how to customize the form.

  // TODO: on submit: pre-fill common fields for train log path, log ids, etc.
  // TODO: on submit: save form data as configuration and attach to processing request
  // TODO: add one more file type: Simod Configuration

  return (
    <Form
      ref={formRef}
      schema={formSchema}
      validator={validator}
      formData={formData}
      onChange={(e) => setFormData(e.formData)}
      onSubmit={(e) => {
        console.log("submitted", e.formData);
      }}
      templates={{
        ButtonTemplates: {
          AddButton,
          RemoveButton,
          MoveDownButton: EmptyElement, // we don't need reordering, the order of values doesn't matter in our case
          MoveUpButton: EmptyElement,
          SubmitButton,
        },
      }}
    />
  );
}

function EmptyElement(props: IconButtonProps) {
  return null;
}

function AddButton(props: IconButtonProps) {
  const { icon, iconType, ...btnProps } = props;
  const { uiSchema, ...restBtnProps } = btnProps;
  return (
    <button {...restBtnProps} className="w-fit">
      <PlusIcon className="w-6" />
    </button>
  );
}

function RemoveButton(props: IconButtonProps) {
  const { icon, iconType, ...btnProps } = props;
  const { uiSchema, ...restBtnProps } = btnProps;
  return (
    <button {...restBtnProps} className="w-fit bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-red-600 p-2">
      <TrashIcon className="w-5" />
    </button>
  );
}

function MoveDownButton(props: IconButtonProps) {
  const { icon, iconType, ...btnProps } = props;
  const { uiSchema, ...restBtnProps } = btnProps;
  return (
    <button {...restBtnProps} className="w-fit">
      <ArrowDownIcon className="w-6" />
    </button>
  );
}

function MoveUpButton(props: IconButtonProps) {
  const { icon, iconType, ...btnProps } = props;
  const { uiSchema, ...restBtnProps } = btnProps;
  return (
    <button {...restBtnProps} className="w-fit">
      <ArrowUpIcon className="w-6" />
    </button>
  );
}

function SubmitButton(props: SubmitButtonProps) {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <button type="submit" className="mt-8 w-1/3">
      Submit
    </button>
  );
}
