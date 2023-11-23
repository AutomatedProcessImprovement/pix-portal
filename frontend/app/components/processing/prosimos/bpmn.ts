import axios from "axios";
import BpmnModdle, { Gateway, Task } from "bpmn-moddle";
import { getFileLocation } from "~/services/files";
import { EventsFromModel, Gateway as Gateway_, ModelTask } from "./bpmn_types";

export type BpmnData = {
  xmlStr: string;
  tasks: ModelTask[];
  gateways: Gateway_[];
  eventsFromModel: EventsFromModel;
};

export async function fetchAndParseBpmn(fileId: string, token: string) {
  let xmlStr: string;
  let tasks: ModelTask[];
  let gateways: Gateway_[];
  let eventsFromModel: EventsFromModel;

  const bpmnBlob = await fetchFile(fileId, token);

  xmlStr = await (bpmnBlob as Blob).text();

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

  eventsFromModel = process?.flowElements
    ?.filter((e: { $type: string }) => e.$type === "bpmn:IntermediateCatchEvent")
    .reduce((acc: {}, t: any) => {
      return {
        ...acc,
        [t.id]: {
          name: t.name,
        },
      };
    }, {} as EventsFromModel);

  return { xmlStr, tasks, gateways, eventsFromModel };
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
