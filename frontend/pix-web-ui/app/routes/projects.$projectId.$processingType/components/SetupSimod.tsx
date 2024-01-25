import { useNavigation } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Input } from "~/components/Input";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { SimodConfiguration } from "./SimodConfiguration";
import { SimodConfigurationForm } from "./simod/SimodConfigurationForm";
import { useFormRef } from "./useFormRef";
import { useSelectedInputAsset } from "./useSelectedInputAsset";

const schema = yup.object().shape({
  shouldNotify: yup.boolean().default(false),
});

export default function SetupSimod() {
  // Simod requires one event log and, optionally, a process model, and, optionally, a configuration file.
  const eventLog = useSelectedInputAsset(AssetType.EVENT_LOG);
  const processModel = useSelectedInputAsset(AssetType.PROCESS_MODEL);
  const simodConfiguration = useSelectedInputAsset(AssetType.SIMOD_CONFIGURATION);

  const [selectedInputAssetsIdsRef, setSelectedInputAssetsIdsRef] = useState<string[]>([]);
  async function handleClick(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const selectedAssets = [eventLog, processModel, simodConfiguration].filter((asset) => asset !== null) as Asset[];
    const assetsIds = selectedAssets.map((asset) => asset.id);
    setSelectedInputAssetsIdsRef(assetsIds);
    toast("Submitting processing request...", { icon: "📡", duration: 5000, position: "top-center" });
  }

  const navigation = useNavigation();

  const methods = useForm({
    // resolver: yupResolver(schema),
    shouldUseNativeValidation: true,
  });

  const formRef = useFormRef();

  function handleSubmit(data: any) {
    console.log("form submitted", data);
  }

  return (
    <ProcessingAppSection heading="Discovery Configuration">
      {!eventLog && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg">
          Select a event log and, optionally, a process model from the input assets on the left.
        </p>
      )}
      {eventLog && (
        <>
          <FormProvider {...methods}>
            <form
              className="flex flex-col items-center w-full my-4"
              ref={formRef}
              onSubmit={methods.handleSubmit(handleSubmit)}
            >
              <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIdsRef.join(",")} />
              <SimodConfiguration eventLog={eventLog} processModel={processModel} />
              <Input
                name="shouldNotify"
                label="Notify by email after completion?"
                inlineLabel={true}
                type="checkbox"
                className="space-x-2 mt-2"
              />
              <button
                className="mt-8 mb-6 w-2/3 xl:w-1/3 text-lg"
                type="submit"
                disabled={eventLog === null || navigation.state === "submitting"}
                onClick={handleClick}
              >
                Start discovery
              </button>
            </form>
          </FormProvider>
          <SimodConfigurationForm />
        </>
      )}
    </ProcessingAppSection>
  );
}
