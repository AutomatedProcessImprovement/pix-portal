import { Tab } from "@headlessui/react";
import { Asset } from "~/services/assets.server";
import { CaseCreation } from "./prosimos/CaseCreation";

const tabs = [
  { name: "Case Creation", component: <CaseCreation /> },
  { name: "Resource Calendars", component: <div>Resource Calendars</div> },
  { name: "Resources", component: <div>Resources</div> },
  { name: "Resource Allocation", component: <div>Resource Allocation</div> },
  { name: "Branching Probabilities", component: <div>Branching Probabilities</div> },
  { name: "Batching", component: <div>Batching</div> },
  { name: "Case Attributes", component: <div>Case Attributes</div> },
  { name: "Prioritisation", component: <div>Prioritisation</div> },
  { name: "Simulation Results", component: <div>Simulation Results</div> },
];

export default function ProsimosConfiguration({ asset }: { asset: Asset | null }) {
  if (!asset) return null;
  return (
    <section className="p-2 space-y-2 border-4 border-blue-100">
      <p>
        {asset.id} ({asset.type})
      </p>
      <Tab.Group>
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
    </section>
  );
}
