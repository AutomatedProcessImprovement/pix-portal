import { Tab } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { UserContext } from "~/routes/contexts";
import { patchAsset, type Asset } from "~/services/assets";
import type { File as File_ } from "~/services/files";
import { FileType, deleteFile, getFileContent, uploadFile } from "~/services/files";
import { FormErrors } from "../../../components/FormErrors";
import { BpmnDataContext } from "./contexts";
import { TabBatching } from "./prosimos/TabBatching";
import { TabCaseArrival } from "./prosimos/TabCaseArrival";
import { TabCaseAttributes } from "./prosimos/TabCaseAttributes";
import { TabGateways } from "./prosimos/TabGateways";
import { TabIntermediateEvents } from "./prosimos/TabIntermediateEvents";
import { TabPrioritisation } from "./prosimos/TabPrioritisation";
import { TabResourceAllocation } from "./prosimos/TabResourceAllocation";
import { TabResourceCalendars } from "./prosimos/TabResourceCalendars";
import { TabResourceProfiles } from "./prosimos/TabResourceProfiles";
import type { BpmnData } from "./prosimos/bpmn";
import { parseBpmn } from "./prosimos/bpmn";
import type { ProsimosConfiguration as TProsimosConfiguration } from "./prosimos/schema";
import { prosimosConfigurationSchema } from "./prosimos/schema";
import { parseSimulationParameters } from "./prosimos/simulation_parameters";

export default function ProsimosConfiguration({ asset }: { asset: Asset | null }) {
  const methods = useForm({
    resolver: yupResolver(prosimosConfigurationSchema),
    shouldUseNativeValidation: true,
  });

  const user = useContext(UserContext);

  const [bpmnData, setBpmnData] = useState<BpmnData | null>(null);
  const [simulationParameters, setSimulationParameters] = useState<TProsimosConfiguration | null>(null);
  const [simulationParametersFile, setSimulationParametersFile] = useState<File_ | null>(null);

  useEffect(() => {
    if (!asset) return;
    if (!user || !user.token) return;
    const token = user.token;

    const fetchAndParseFiles = async () => {
      let bpmnFile: File_ | undefined;
      let jsonFile: File_ | undefined;
      for (const file of asset.files ?? []) {
        if (file.type === FileType.PROCESS_MODEL_BPMN) bpmnFile = file;
        if (file.type === FileType.SIMULATION_MODEL_PROSIMOS_JSON) jsonFile = file;
      }

      if (!bpmnFile) return;
      const bpmnBlob = await getFileContent(bpmnFile?.id, token);
      const bpmnData = await parseBpmn(bpmnBlob);

      if (!jsonFile) return;
      const jsonBlob = await getFileContent(jsonFile?.id, token);
      const [jsonData, parametersParsingError] = await parseSimulationParameters(jsonBlob);

      return { bpmnData, jsonData, jsonFile, parametersParsingError };
    };

    fetchAndParseFiles().then((result) => {
      if (result) {
        const { bpmnData, jsonData, jsonFile, parametersParsingError } = result;

        if (parametersParsingError) {
          console.error("error parsing simulation parameters", Object.entries(parametersParsingError));
          methods.setError("root", { message: parametersParsingError.message });
        }

        if (jsonData) methods.reset(jsonData);
        setBpmnData(bpmnData);
        setSimulationParameters(jsonData);
        setSimulationParametersFile(jsonFile);
      }
    });
  }, [asset, user, methods]);

  const onSubmit = useCallback(
    async (data: any) => {
      const newSimulationParameters = data as TProsimosConfiguration;
      console.log("newSimulationParameters", newSimulationParameters);
      console.log("simulationParameters", simulationParameters, "simulationParametersFile", simulationParametersFile);

      if (!simulationParametersFile) {
        console.log("Simulation parameters file is not available yet.");
        return;
      }

      if (!asset) {
        console.error("Asset ID is not available.");
        return;
      }

      // upload the new file
      const jsonBlob = new Blob([JSON.stringify(newSimulationParameters)], { type: "application/json" });
      const jsonFileName = simulationParametersFile?.name ?? `${uuidv4()}.json`;
      if (!user?.token) return;
      const jsonFile = await uploadFile(jsonBlob, jsonFileName, FileType.SIMULATION_MODEL_PROSIMOS_JSON, user?.token);
      console.log("new simulation parameters file", jsonFile);

      // update the simulation parameters for the asset
      const fileIds = asset?.files_ids.filter((id) => id !== simulationParametersFile.id) ?? [];
      const assetUpdate = {
        files_ids: [...fileIds, jsonFile.id],
      };
      const updatedAsset = await patchAsset(assetUpdate, asset?.id, user?.token);
      console.log("updated asset", updatedAsset);

      // remove the old file if all is successful
      if (updatedAsset) {
        await deleteFile(simulationParametersFile.id, user?.token);
        console.log("deleted old file", simulationParametersFile.id);
      }
    },
    [asset, user, simulationParametersFile, simulationParameters]
  );

  const tabs = [
    { name: "Case Arrival", component: <TabCaseArrival /> },
    { name: "Resource Calendars", component: <TabResourceCalendars /> },
    { name: "Resources Profiles", component: <TabResourceProfiles /> },
    { name: "Resource Allocation", component: <TabResourceAllocation /> },
    { name: "Branching Probabilities", component: <TabGateways /> },
    { name: "Intermediate Events", component: <TabIntermediateEvents /> },
    { name: "Batching", component: <TabBatching /> },
    { name: "Case Attributes", component: <TabCaseAttributes /> },
    { name: "Prioritisation", component: <TabPrioritisation /> },
  ];

  if (!asset) return null;
  return (
    <section className="space-y-2 flex flex-col items-center">
      <FormProvider {...methods}>
        <BpmnDataContext.Provider value={bpmnData}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-8 p-4 border-4 border-slate-200 bg-slate-50 rounded-xl"
          >
            <Tab.Group defaultIndex={0}>
              <Tab.List className="flex flex-wrap justify-center">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `px-2 py-1 mr-1 mb-1 hover:bg-blue-200 border-2 text-slate-900 rounded-xl ${
                        selected ? "bg-slate-50  border-slate-300" : "bg-slate-200 border-slate-50"
                      }`
                    }
                  >
                    {tab.name}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                {tabs.map((tab) => (
                  <Tab.Panel key={tab.name}>{tab.component}</Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
            {methods.formState.errors && Object.keys(methods.formState.errors).length > 0 && (
              <FormErrors errors={methods.formState.errors} />
            )}
            <button type="submit" className="w-1/3 bg-emerald-500 hover:bg-emerald-600 text-lg">
              Save Configuration
            </button>
          </form>
        </BpmnDataContext.Provider>
      </FormProvider>
    </section>
  );
}
