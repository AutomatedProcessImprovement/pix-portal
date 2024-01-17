export interface ResourceUtilizationItem {
  ["Resource ID"]: string;
  ["Resource name"]: string;
  ["Utilization Ratio"]: number;
  ["Tasks Allocated"]: number;
  ["Worked Time (seconds)"]: number; //seconds
  ["Available Time (seconds)"]: number; //seconds
  ["Pool ID"]: string;
  ["Pool name"]: string;
}

export interface IndividualTaskStatisticsItem {
  ["Name"]: string;
  ["Count"]: number;
  ["Min Duration"]: number;
  ["Max Duration"]: number;
  ["Avg Duration"]: number;
  ["Total Duration"]: number;
  ["Min Waiting Time"]: number;
  ["Max Waiting Time"]: number;
  ["Avg Waiting Time"]: number;
  ["Total Waiting Time"]: number;
  ["Min Processing Time"]: number;
  ["Max Processing Time"]: number;
  ["Avg Processing Time"]: number;
  ["Total Processing Time"]: number;
  ["Min Cycle Time"]: number;
  ["Max Cycle Time"]: number;
  ["Avg Cycle Time"]: number;
  ["Total Cycle Time"]: number;
  ["Min Idle Time"]: number;
  ["Max Idle Time"]: number;
  ["Avg Idle Time"]: number;
  ["Total Idle Time"]: number;
  ["Min Idle Cycle Time"]: number;
  ["Max Idle Cycle Time"]: number;
  ["Avg Idle Cycle Time"]: number;
  ["Total Idle Cycle Time"]: number;
  ["Min Idle Processing Time"]: number;
  ["Max Idle Processing Time"]: number;
  ["Avg Idle Processing Time"]: number;
  ["Total Idle Processing Time"]: number;
  ["Min Cost"]: number;
  ["Avg Cost"]: number;
  ["Total Cost"]: number;
}

export interface ScenarioStatisticsItem {
  ["KPI"]: string;
  ["Min"]: number;
  ["Max"]: number;
  ["Average"]: number;
  ["Accumulated Value"]: number;
  ["Trace Ocurrences"]: number;
}

export interface ReportPart {
  title: string;
  data: object[];
}

export type ProsimosReport = ReportPart[];
