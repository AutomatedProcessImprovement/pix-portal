import axios from "axios";
import BpmnModdle from "bpmn-moddle";
import { getFileLocation } from "~/services/files";
import { EventsFromModel, Gateways, ModelTask, SequenceElements } from "./bpmn_types";

export type BpmnData = {
  xmlStr: string;
  tasks: ModelTask[];
  gateways: Gateways;
  eventsFromModel: EventsFromModel;
};

export async function fetchAndParseBpmn(fileId: string, token: string) {
  let xmlStr: string;
  let tasks: ModelTask[];
  let gateways: Gateways;
  let eventsFromModel: EventsFromModel;

  const bpmnBlob = await fetchFile(fileId, token);

  xmlStr = await (bpmnBlob as Blob).text();

  const moddle = new BpmnModdle();
  const { rootElement }: any = await moddle.fromXML(xmlStr);
  const process = rootElement?.rootElements?.find((e: { $type: string }) => e.$type === "bpmn:Process");

  tasks = process?.flowElements
    ?.filter((e: { $type: string }) => e.$type === "bpmn:Task")
    .reduce((acc: [], t: any) => {
      const taskDocs = t.documentation?.[0]?.text;
      const resourceName = taskDocs !== undefined ? JSON.parse(taskDocs)?.resource : "";

      return [
        ...acc,
        {
          id: t.id,
          name: t.name,
          resource: resourceName,
        },
      ];
    }, [] as ModelTask[]);
  console.log("tasks", tasks);

  gateways = process?.flowElements
    ?.filter((e: { $type: string }) => e.$type === "bpmn:ExclusiveGateway" || e.$type === "bpmn:InclusiveGateway")
    .reduce((acc: {}, current: any) => {
      const outgoingPathes = current.outgoing;
      const childs = outgoingPathes.reduce((acc: {}, item: any) => {
        return {
          ...acc,
          [item.id]: {
            name: item.name ?? targetTaskNameForGateway(item, process.flowElements),
          },
        };
      }, {} as SequenceElements);

      return {
        ...acc,
        [current.id]: {
          type: current.$type,
          name: current.name,
          childs: childs,
        },
      };
    }, {} as Gateways);
  console.log("gateways", gateways);

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
  console.log("eventsFromModel", eventsFromModel);

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

function targetTaskNameForGateway(item: any, elementRegistry: any) {
  let taskName = "";
  if (item.name === undefined) {
    const flowObjId = item.targetRef !== undefined ? item.targetRef.id : item.target.id;
    const el = elementRegistry._elements[flowObjId]?.element;
    if (el?.type === "bpmn:Task") {
      taskName = el.businessObject.name;
    }
  }
  return taskName;
}
