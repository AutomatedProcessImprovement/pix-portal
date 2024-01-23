import { yupResolver } from "@hookform/resolvers/yup";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Input } from "~/components/Input";
import type { Asset } from "~/services/assets";
import { AssetType } from "~/services/assets";
import { AssetCard } from "./AssetCard";
import { ProcessingAppSection } from "./ProcessingAppSection";
import { useFormRef } from "./useFormRef";
import { useSelectedInputAsset } from "./useSelectedInputAsset";

const schema = yup.object().shape({
  shouldNotify: yup.boolean().default(false),
});

export default function SetupKronos() {
  // Kronos requires one event log
  const eventLog = useSelectedInputAsset(AssetType.EVENT_LOG);

  const [selectedInputAssetsIdsRef, setSelectedInputAssetsIdsRef] = useState<string[]>([]);
  async function handleClick(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setSelectedInputAssetsIdsRef([eventLog!.id]);
    toast("Submitting processing request...", { icon: "📡", duration: 5000, position: "top-center" });
  }

  const navigation = useNavigation();

  const methods = useForm({
    resolver: yupResolver(schema),
    shouldUseNativeValidation: true,
  });

  const formRef = useFormRef();

  return (
    <ProcessingAppSection heading="Waiting Time Analysis Configuration">
      {!eventLog && (
        <p className="my-4 py-2 prose prose-md prose-slate max-w-lg">
          Select a event log from the input assets on the left.
        </p>
      )}
      {eventLog && (
        <Form method="post" className="flex flex-col items-center w-full my-4" ref={formRef}>
          <FormProvider {...methods}>
            <input type="hidden" name="selectedInputAssetsIds" value={selectedInputAssetsIdsRef.join(",")} />
            <KronosConfiguration eventLog={eventLog} />
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
              Start analysis
            </button>
          </FormProvider>
        </Form>
      )}
    </ProcessingAppSection>
  );
}

function KronosConfiguration({ eventLog }: { eventLog: Asset }) {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-4 border-slate-200 bg-slate-50 rounded-xl">
      <AssetCard asset={eventLog} isActive={false} isInteractive={false} />
    </div>
  );
}
