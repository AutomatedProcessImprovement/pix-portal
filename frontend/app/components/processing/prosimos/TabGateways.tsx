import { useContext, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BpmnDataContext } from "../contexts";
import FormSection from "./FormSection";
import { Input } from "./Input";
import { Gateway } from "./bpmn_types";

export function TabGateways() {
  const name = "gateway_branching_probabilities";

  const bpmnData = useContext(BpmnDataContext);
  const [gateways, setGateways] = useState<Gateway[]>([]);

  useEffect(() => {
    setGateways(bpmnData?.gateways || []);
  }, [bpmnData]);

  return (
    <div className="flex flex-col space-y-4">
      <FormSection title="Branching Probabilties">
        {gateways.map((gateway, index) => {
          return <GatewayProbabilities key={gateway.id} name={`${name}[${index}]`} gateway={gateway} />;
        })}
      </FormSection>
    </div>
  );
}

function GatewayProbabilities({ name, gateway }: { name: string; gateway: Gateway }) {
  const { control, setValue } = useFormContext();

  const { fields, append } = useFieldArray({
    control,
    name: `${name}.probabilities`,
  });

  useEffect(() => {
    if (fields.length === 0) {
      setValue(`${name}.gateway_id`, gateway.id);

      gateway.outgoingFlows?.forEach((outgoing) => {
        append({ path_id: outgoing.id, value: 0 });
      });
    }
  }, []);

  return (
    <div className="p-2 border-4">
      <span className="">
        Flow: {gateway.id} ({gateway.name})
      </span>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex">
            <Input
              name={`${name}.probabilities[${index}].path_id`}
              type="text"
              label="Path ID"
              disabled={true}
              pure={true}
              className="flex-grow"
            ></Input>
            <Input
              name={`${name}.probabilities[${index}].value`}
              type="number"
              label="Probability"
              pure={true}
              className="w-20"
            ></Input>
          </div>
        );
      })}
    </div>
  );
}
