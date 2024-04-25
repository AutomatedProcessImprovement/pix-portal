import moment from "moment";
import type { ConsParams } from "~/shared/optimos_json_type";

export const timePeriodToBinary = (startTime: string, endTime: string, delta: number, num_slots: number) => {
  const start_of_day = moment(new Date("1970-01-01T00:00:00"));
  const tp_start = moment(new Date("1970-01-01T" + startTime));
  const tp_end = moment(new Date("1970-01-01T" + endTime));

  let res = "";

  const current = start_of_day;
  for (let i = 0; i < num_slots; i++) {
    // TODO: Ask why this condition is ()
    if (current.isBetween(tp_start, tp_end, "minute", "()")) {
      res += "1";
    } else {
      res += "0";
    }
    current.add(delta, "minutes");
    // console.log(current.format('hh:mm:ss'))
  }
  return parseInt(res, 2);
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const applyConstraintsToResources = (
  resources: ConsParams["resources"],
  srcResourceId: string,
  targetResourceIds: string[]
) => {
  const srcConstraints = resources.find((resource) => resource.id === srcResourceId)?.constraints;
  if (!srcConstraints) return resources;

  for (const targetResourceId of targetResourceIds) {
    if (targetResourceId === srcResourceId) continue;
    const targetResource = resources.find((resource) => resource.id === targetResourceId);
    if (!targetResource) continue;

    targetResource.constraints = deepClone(srcConstraints);
  }

  return resources;
};
