export const colors = {
  'BPMN': 'bpmn',
  'EVENT LOG': 'event_log',
  'SIM MODEL': 'sim_model',
  'CONS MODEL': 'cons_model',
  'UNTAGGED': 'untagged'
}


export const fileTags = [
  'BPMN',
  'EVENT LOG',
  'SIM MODEL',
  'CONS MODEL',
  'UNTAGGED'
];

export const tValToActual = {
  'BPMN': 'BPMN',
  'EVENT LOG': 'EVENT_LOG',
  'SIM MODEL': 'SIM_MODEL',
  'CONS MODEL': 'CONS_MODEL',
  'UNTAGGED': 'UNTAGGED'
}

export interface Selectable {
  SIMOD: boolean;
  PROSIMOS: boolean;
  OPTIMOS: boolean;
}