import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigation } from "@remix-run/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { UserContext } from "~/routes/contexts";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { SimodConfigurationForm } from "./simod/SimodConfigurationForm";
import { useFormRef } from "./useFormRef";
import { useSelectedInputAsset } from "./useSelectedInputAsset";
import { useSimodConfigurationFromAsset } from "./useSimodConfigurationFromAsset";

const schema = yup.object().shape({
  shouldNotify: yup.boolean().default(false),
  selectedInputAssetsIds: yup.string().required(),
});

export default function SetupSimod() {
  // Simod requires one event log and, optionally, a process model, and, optionally, a configuration file.
  const [eventLogAsset] = useSelectedInputAsset(AssetType.EVENT_LOG);
  const [processModelAsset] = useSelectedInputAsset(AssetType.PROCESS_MODEL);
  const [simodConfigurationAsset, setSimodConfigurationAsset] = useSelectedInputAsset(AssetType.SIMOD_CONFIGURATION);

  const [selectedInputAssetsIds, setSelectedInputAssetsIds] = useState<string[]>([]);

  const updateSelectedInputAssetsIds = useCallback(() => {
    const selectedAssets = [eventLogAsset, processModelAsset, simodConfigurationAsset].filter(
      (asset) => asset !== null
    ) as Asset[];
    const assetsIds = selectedAssets.map((asset) => asset.id);
    setSelectedInputAssetsIds(assetsIds);
  }, [eventLogAsset, processModelAsset, simodConfigurationAsset]);

  useEffect(() => {
    updateSelectedInputAssetsIds();
  }, [simodConfigurationAsset, eventLogAsset, processModelAsset, updateSelectedInputAssetsIds]);

  const navigation = useNavigation();

  const methods = useForm({
    resolver: yupResolver(schema),
    shouldUseNativeValidation: true,
  });

  const formRef = useFormRef();

  function handleClick(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    updateSelectedInputAssetsIds();
    toast("Submitting processing request...", { icon: "📡", duration: 5000, position: "top-center" });
    formRef.current?.submit();
  }

  // if Simod configuration is provided, read its values
  const user = useContext(UserContext);
  const preloadedSimodConfiguration = useSimodConfigurationFromAsset({ asset: simodConfigurationAsset, user });

  return (
    <ProcessingAppSection heading="Discovery Configuration">
      {!eventLogAsset && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg">
          Select a event log and, optionally, a process model from the input assets on the left.
        </p>
      )}
      {eventLogAsset && (
        <>
          <SimodConfigurationForm
            simodConfiguration={preloadedSimodConfiguration}
            simodConfigurationAsset={simodConfigurationAsset}
            setSimodConfigurationAsset={setSimodConfigurationAsset}
          />
          <FormProvider {...methods}>
            <form method="post" className="flex flex-col items-center w-full mt-2 mb-6 p-4" ref={formRef}>
              <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIds.join(",")} />
              {/* <SimodConfiguration eventLog={eventLog} processModel={processModel} /> */}
              <button
                className="w-2/3 xl:w-1/3 text-lg"
                type="submit"
                disabled={eventLogAsset === null || navigation.state === "submitting"}
                onClick={handleClick}
              >
                Start discovery
              </button>
              <Input
                name="shouldNotify"
                label="Notify by email after completion?"
                inlineLabel={true}
                type="checkbox"
                className="space-x-2 mt-1"
              />
            </form>
          </FormProvider>
        </>
      )}
    </ProcessingAppSection>
  );
}
