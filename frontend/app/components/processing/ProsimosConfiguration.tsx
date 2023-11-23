import { Tab } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Asset } from "~/services/assets";
import { FileType } from "~/services/files";
import { BpmnDataContext, UserContext } from "./contexts";
import { FormErrors } from "./prosimos/FormErrors";
import { TabBatching } from "./prosimos/TabBatching";
import { TabCaseAttributes } from "./prosimos/TabCaseAttributes";
import { TabCaseCreation } from "./prosimos/TabCaseCreation";
import { TabGateways } from "./prosimos/TabGateways";
import { TabPrioritisation } from "./prosimos/TabPrioritisation";
import { TabResourceAllocation } from "./prosimos/TabResourceAllocation";
import { TabResourceCalendars } from "./prosimos/TabResourceCalendars";
import { TabResourceProfiles } from "./prosimos/TabResourceProfiles";
import { BpmnData, fetchAndParseBpmn } from "./prosimos/bpmn";
import { prosimosConfigurationSchema } from "./prosimos/configuration_schema";

export default function ProsimosConfiguration({ asset }: { asset: Asset | null }) {
  const methods = useForm({
    resolver: yupResolver(prosimosConfigurationSchema),
    shouldUseNativeValidation: true,
  });

  const user = useContext(UserContext);

  const [bpmnData, setBpmnData] = useState<BpmnData | null>(null);

  useEffect(() => {
    if (!asset) return;

    const parseBpmn = async () => {
      const bpmnFile = asset.files?.find((file) => file.type === FileType.PROCESS_MODEL_BPMN);
      if (!bpmnFile || !user || !user?.token) return;
      const bpmnData = await fetchAndParseBpmn(bpmnFile?.id, user?.token);
      return bpmnData;
    };

    parseBpmn().then((bpmnData) => {
      if (bpmnData) setBpmnData(bpmnData);
    });
  }, [asset]);

  useEffect(() => {
    console.log("formState.errors", methods.formState.errors);
  }, [methods.formState.errors]);

  function onSubmit(data: any) {
    console.log("ProsimosConfiguration data", data);
  }

  const tabs = [
    { name: "Case Creation", component: <TabCaseCreation /> },
    { name: "Resource Calendars", component: <TabResourceCalendars /> },
    { name: "Resources Profiles", component: <TabResourceProfiles /> },
    { name: "Resource Allocation", component: <TabResourceAllocation /> },
    { name: "Branching Probabilities", component: <TabGateways /> },
    { name: "Batching", component: <TabBatching /> },
    { name: "Case Attributes", component: <TabCaseAttributes /> },
    { name: "Prioritisation", component: <TabPrioritisation /> },
    { name: "Simulation Results", component: <div>Simulation Results</div> },
  ];

  if (!asset) return null;
  return (
    <section className="p-2 space-y-2 border-4 border-blue-100">
      <p>
        {asset.id} ({asset.type})
      </p>
      <FormProvider {...methods}>
        <BpmnDataContext.Provider value={bpmnData}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-2">
            <Tab.Group defaultIndex={0}>
              <Tab.List>
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `px-2 py-1 mr-1 mb-1 hover:bg-blue-200  text-slate-900 rounded-none ${
                        selected ? "bg-blue-200" : "bg-blue-50"
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
            {methods.formState.errors && <FormErrors errors={methods.formState.errors} />}
            <button type="submit">Submit</button>
          </form>
        </BpmnDataContext.Provider>
      </FormProvider>
    </section>
  );
}
