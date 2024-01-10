import { useContext, useEffect, useState } from "react";
import { Input } from "../../../../components/Input";
import { BpmnDataContext } from "../contexts";
import { DistributionNameAndValues } from "./DistributionNameAndValues";
import FormSection from "./FormSection";
import type { IntermediateCatchEvent } from "./bpmn";

export function TabIntermediateEvents() {
  const name = "event_distribution";

  const [events, setEvents] = useState<IntermediateCatchEvent[]>([]);
  const bpmnData = useContext(BpmnDataContext);
  useEffect(() => {
    console.log("bpmnData", bpmnData);
    console.log("bpmnData?.catchEvents", bpmnData?.catchEvents);
    setEvents(bpmnData?.catchEvents ?? []);
  }, [bpmnData]);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Intermediate Catch Events" className="space-y-4">
        {events.map((event, index) => {
          return <IntermediateEvent key={event.id} name={`${name}[${index}]`} catchEvent={event} />;
        })}
      </FormSection>
    </div>
  );
}

function IntermediateEvent({ name, catchEvent }: { name: string; catchEvent: IntermediateCatchEvent }) {
  return (
    <div className="p-2 border-4">
      <h4 className="text-lg font-semibold mb-4">
        Event: {catchEvent.id} ({catchEvent.name})
        <Input name={`${name}.event_id`} type="hidden" value={catchEvent.id} pure={true} />
      </h4>
      <DistributionNameAndValues name={`${name}`} />
    </div>
  );
}
