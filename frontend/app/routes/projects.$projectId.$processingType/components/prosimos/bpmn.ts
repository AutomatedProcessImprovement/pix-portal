import axios from "axios";
import type { Gateway, Task } from "bpmn-moddle";
import BpmnModdle from "bpmn-moddle";
import { getFileLocation } from "~/services/files";
import type { Gateway as Gateway_, ModelTask } from "./bpmn_types";

export type BpmnData = {
  xmlStr: string;
  tasks: ModelTask[];
  gateways: Gateway_[];
  catchEvents: IntermediateCatchEvent[];
};

export type IntermediateCatchEvent = {
  id: string;
  name: string;
};

export async function parseBpmn(bpmnBlob: Blob) {
  let xmlStr: string;
  let tasks: ModelTask[];
  let gateways: Gateway_[];
  let catchEvents: IntermediateCatchEvent[];

  xmlStr = await bpmnBlob.text();

  const moddle = new BpmnModdle();
  const { elementsById, references, rootElement, warnings }: any = await moddle.fromXML(xmlStr);
  console.log("warnings", warnings);
  const process = rootElement?.rootElements?.find((e: { $type: string }) => e.$type === "bpmn:Process");

  tasks = process?.flowElements
    ?.filter((e: { $type: string }) => e.$type === "bpmn:Task")
    .reduce((acc: [], task: Task) => {
      return [
        ...acc,
        {
          id: task.id,
          name: task.name,
        },
      ];
    }, [] as ModelTask[]);

  gateways = process?.flowElements
    ?.filter(
      (e: Gateway) =>
        (e.$type === "bpmn:ExclusiveGateway" || e.$type === "bpmn:InclusiveGateway") &&
        (e.gatewayDirection === "Diverging" || e.gatewayDirection === "Mixed")
    )
    .reduce((acc: [], current: Gateway) => {
      const targets = references
        .filter((r: any) => r.id === current.id && r.property === "bpmn:sourceRef")
        .map((r: any) => r.element.targetRef);

      return [
        ...acc,
        {
          id: current.id,
          name: current.name,
          outgoingFlows: targets,
        },
      ];
    }, [] as Gateway_[]);

  catchEvents = process?.flowElements
    ?.filter((e: { $type: string }) => e.$type === "bpmn:IntermediateCatchEvent")
    .reduce((acc: [], t: any) => {
      return [
        ...acc,
        {
          id: t.id,
          name: t.name,
        },
      ];
    }, [] as IntermediateCatchEvent[]);

  return { xmlStr, tasks, gateways, catchEvents };
}

async function fetchFile(fileId: string, token: string) {
  const fileLocation = await getFileLocation(fileId, token);
  const response = await axios.get(fileLocation.location, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

function targetTaskNameForGateway(item: any, flowElements: any) {
  let taskName = "";
  if (item.name === undefined) {
    const flowObjId = item.targetRef !== undefined ? item.targetRef.id : item.target.id;
    const el = flowElements.find((e: any) => e.id === flowObjId);
    if (el?.type === "bpmn:Task") {
      taskName = el.businessObject.name;
    }
  }
  return taskName;
}
