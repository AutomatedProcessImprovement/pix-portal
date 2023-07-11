import { useEffect, useState } from "react";
import BpmnModdle from "bpmn-moddle";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { AllModelTasks, EventsFromModel, Gateways, SequenceElements, EventDetails } from '../modelData';

const useBpmnFile = (bpmnFile: any) => {
    const [xmlData, setXmlData] = useState<string>("")
    const [tasksFromModel, setTasksFromModel] = useState<AllModelTasks>({})
    const [gateways, setGateways] = useState<Gateways>({})
    const [eventsFromModel, setEventsFromModel] = useState<EventsFromModel | undefined>(undefined) // dict of id and name of the intermediate events

    const getTargetTaskNameForGateway = (item: any, elementRegistry: any) => {
        let taskName = ""
        if (item.name === undefined) {
            const flowObjId = (item.targetRef !== undefined) ? item.targetRef.id : item.target.id
            const el = elementRegistry._elements[flowObjId]?.element
            if (el?.type === "bpmn:Task") {
                taskName = el.businessObject.name
            }
        }

        return taskName
    };

    useEffect(() => {
        const bpmnFileReader = new FileReader()
        bpmnFileReader.readAsText(bpmnFile)
        bpmnFileReader.onloadend = () => {
            const importXml = async () => {
                const fileData = bpmnFileReader.result as string
                setXmlData(fileData)
                localStorage.setItem("bpmnContent", fileData)

                const modeler = new BpmnModeler()
                const result = await modeler.importXML(fileData)

                if (process.env.NODE_ENV === 'development') {
                    const { warnings } = result;
                    console.log(warnings)
                }

                // moddle
                const moddle = new BpmnModdle()
                await moddle.fromXML(fileData)

                const elementRegistry = modeler.get('elementRegistry')

                const tasks = elementRegistry
                    .filter((e: { type: string; }) => e.type === 'bpmn:Task')
                    .reduce((acc: {}, t: any) => {
                        const taskDocs = t.businessObject?.documentation?.[0]?.text
                        const resourceName = (taskDocs !== undefined) ? JSON.parse(taskDocs)?.resource : ""

                        return {
                            ...acc,
                            [t.id]: {
                                name: t.businessObject.name,
                                resource: resourceName
                            }
                        }
                    }, {})
                setTasksFromModel(tasks)

                const gateways = elementRegistry
                    .filter((e: { type: string; }) =>
                        e.type === "bpmn:ExclusiveGateway" ||
                        e.type === "bpmn:InclusiveGateway"
                    )
                    .reduce((acc: any, current: { id: any; businessObject: any, type: any, outgoing?: any }) => {
                        const bObj = current.businessObject
                        if (bObj.gatewayDirection in ["Unspecified", "Converging"]) {
                            // ignore gateways with "Unspecified", "Converging" direction type
                            return acc
                        }
                        const outgoingPathes = (bObj.outgoing !== undefined) ? bObj.outgoing : current.outgoing
                        const childs = outgoingPathes.reduce((acc: {}, item: any) => {
                            return {
                                ...acc,
                                [item.id]: {
                                    name: item.name ?? getTargetTaskNameForGateway(item, elementRegistry)
                                }
                            }
                        }, {} as SequenceElements)

                        return {
                            ...acc,
                            [current.id]: {
                                type: current.type,
                                name: current.businessObject.name,
                                childs: childs
                            }
                        }
                    }, {} as Gateways)
                setGateways(gateways)

                const eventsFromModel = elementRegistry
                    .filter((e: { type: string; }) => e.type === 'bpmn:IntermediateCatchEvent')
                    .reduce((acc: EventsFromModel, t: any) => {
                        acc.add(t.id, new EventDetails({ name: t.businessObject?.name ?? "" }))
                        return acc
                    }, new EventsFromModel())

                setEventsFromModel(eventsFromModel)
            }

            try {
                importXml()
            }
            catch (err: any) {
                console.log(err.message, err.warnings);
            }
        }
    }, [bpmnFile]);

    return { xmlData, tasksFromModel, gateways, eventsFromModel }
}

export default useBpmnFile;