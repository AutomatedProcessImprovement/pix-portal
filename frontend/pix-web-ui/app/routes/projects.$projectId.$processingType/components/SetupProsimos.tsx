import { yupResolver } from "@hookform/resolvers/yup";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { UserContext } from "~/routes/contexts";
import type { Asset } from "~/services/assets";
import { AssetType, getAsset } from "~/services/assets";
import { SelectedAssetsContext } from "../contexts";
import { useFormRef } from "../hooks/useFormRef";
import { ProcessingAppSection } from "./ProcessingAppSection";
import ProsimosConfiguration from "./ProsimosConfiguration";

const schema = yup.object().shape({
  shouldNotify: yup.boolean().default(false),
});

export default function SetupProsimos() {
  const navigation = useNavigation();
  const selectedAssetsIdsRef = useRef<HTMLInputElement>(null);
  const [simulationModel, setSimulationModel] = useState<Asset | null>(null);

  const user = useContext(UserContext);
  const selectedAssets = useContext(SelectedAssetsContext);

  const fetchSimulationModel = useCallback(async () => {
    const simulationModel = selectedAssets.find((asset) => asset.type === AssetType.SIMULATION_MODEL);
    if (simulationModel && user?.token) {
      // this call populates the files field with the file objects, so we can find a BPMN model file and fetch its content
      const asset = await getAsset(simulationModel.id, user?.token, false);
      setSimulationModel(asset);
    } else {
      setSimulationModel(null);
    }
  }, [selectedAssets, user?.token]);

  useEffect(() => {
    selectedAssetsIdsRef.current!.value = selectedAssets.map((asset) => asset.id).join(",");
    fetchSimulationModel();
  }, [selectedAssets, fetchSimulationModel]);

  const submitProsimosSimulation = useSubmit();

  const methods = useForm({
    resolver: yupResolver(schema),
    shouldUseNativeValidation: true,
  });

  const formRef = useFormRef();

  return (
    <ProcessingAppSection heading="Simulation Configuration">
      <ProsimosConfiguration asset={simulationModel} />
      <Form
        method="post"
        className="flex flex-col items-center w-full mt-2"
        onChange={(e) => submitProsimosSimulation(e.currentTarget)}
        ref={formRef}
      >
        <FormProvider {...methods}>
          <input type="hidden" name="selectedInputAssetsIds" ref={selectedAssetsIdsRef} />
          {!simulationModel && (
            <p className="py-2 prose prose-md prose-slate max-w-lg">
              Select a simulation model from the input assets on the left.
            </p>
          )}
          {simulationModel && (
            <>
              <Input
                name="shouldNotify"
                label="Notify by email after completion?"
                inlineLabel={true}
                type="checkbox"
                className="space-x-2"
              />
              <button
                className="mt-8 mb-6 w-2/3 xl:w-1/3 text-lg"
                type="submit"
                disabled={simulationModel === null || navigation.state === "submitting"}
                onClick={() => {
                  toast("Submitting processing request...", { icon: "📡", duration: 5000, position: "top-center" });
                }}
              >
                Start simulation
              </button>
            </>
          )}
        </FormProvider>
      </Form>
    </ProcessingAppSection>
  );
}
