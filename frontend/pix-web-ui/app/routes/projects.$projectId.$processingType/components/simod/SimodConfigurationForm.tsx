import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useMatches } from "@remix-run/react";
import type { IChangeEvent } from "@rjsf/core";
import Form from "@rjsf/core";
import type { IconButtonProps, RJSFSchema, SubmitButtonProps } from "@rjsf/utils";
import * as rjsfUtils from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { createRef, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import YAML from "yaml";
import { UserContext } from "~/routes/contexts";
import type { Asset } from "~/services/assets";
import { AssetType, createAsset, patchAsset } from "~/services/assets";
import { FileType, deleteFile, uploadFile } from "~/services/files";
import schema from "./simod_configuration_schema.json";

const { getSubmitButtonOptions } = rjsfUtils;

// More on JSON Schema: https://json-schema.org/learn/getting-started-step-by-step
const formSchema = schema as RJSFSchema;

export function SimodConfigurationForm({
  simodConfiguration, // parsed values from the asset if provided
  simodConfigurationAsset,
  setSimodConfigurationAsset,
}: {
  simodConfiguration?: any;
  simodConfigurationAsset: Asset | null;
  setSimodConfigurationAsset: React.Dispatch<React.SetStateAction<Asset | null>>;
}) {
  // See https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-templates
  // for more information on how to customize the form.
  const [formData, setFormData] = useState(null);
  const formRef = createRef<Form>();

  useEffect(() => {
    if (simodConfiguration) {
      setFormData(simodConfiguration);
    }
  }, [simodConfiguration]);

  const removeNulls = useCallback((obj: any) => {
    if (typeof obj !== "object") return obj;
    for (const k in obj) {
      if (obj[k] === null) {
        delete obj[k];
      } else if (typeof obj[k] === "object") {
        removeNulls(obj[k]);
      }
    }
    return obj;
  }, []);

  const user = useContext(UserContext);
  const projectId = useMatches().filter((match) => match.id === "routes/projects.$projectId")[0].params.projectId;
  const handleSubmit = useCallback(
    // save form data as configuration file, create or update the asset, and update the selected asset IDs
    async (e: IChangeEvent) => {
      if (!e.formData) {
        console.error("form data is empty");
        return;
      }
      if (!user?.token) {
        console.error("user token is empty");
        return;
      }
      if (!projectId) {
        console.error("project id is empty");
        return;
      }
      const content = YAML.stringify(removeNulls(e.formData));
      const blob = new Blob([content], { type: "text/yaml" });
      const fileName = `${uuidv4()}.yaml`;
      const yamlFile = await uploadFile(blob, fileName, FileType.CONFIGURATION_SIMOD_YAML, user.token);

      if (!simodConfigurationAsset) {
        // create new asset
        const newAsset = await createAsset(
          [yamlFile.id],
          fileName,
          AssetType.SIMOD_CONFIGURATION,
          projectId,
          user.token
        );
        setSimodConfigurationAsset(newAsset);
        // we issue an event to update the assets list in the UI only when a new asset is created
        document.dispatchEvent(new Event("assetsUpdated"));
        toast.success("Simod configuration saved", { duration: 5000 });
      } else {
        // update existing asset
        const updatedAsset = await patchAsset({ files_ids: [yamlFile.id] }, simodConfigurationAsset.id, user.token);
        if (updatedAsset) {
          // remove the old file if all is successful
          try {
            await deleteFile(simodConfigurationAsset.files_ids[0], user.token);
          } catch (e) {
            console.error("error deleting old file", e);
            // don't throw, still continue with the update below because the asset was updated
          }
        }
        setSimodConfigurationAsset(updatedAsset);
        toast.success("Simod configuration updated", { duration: 5000 });
      }
    },
    [user?.token, simodConfigurationAsset, setSimodConfigurationAsset, projectId, removeNulls]
  );

  return (
    <div className="flex flex-col items-center space-y-8 p-4">
      <Form
        ref={formRef}
        schema={formSchema}
        validator={validator}
        formData={formData}
        onChange={(e) => setFormData(e.formData)}
        onSubmit={handleSubmit}
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
    </div>
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
    <button type="submit" className="mt-8 w-1/3 bg-emerald-500 hover:bg-emerald-600 text-lg">
      Save Configuration
    </button>
  );
}
