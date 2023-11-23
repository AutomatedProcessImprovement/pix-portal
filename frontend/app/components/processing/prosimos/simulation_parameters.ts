import { prosimosConfigurationSchema } from "./schema";

export async function parseSimulationParameters(jsonBlob: Blob) {
  const jsonStr = await jsonBlob.text();
  const json = JSON.parse(jsonStr);
  let simulationParameters = await prosimosConfigurationSchema.validate(json);

  simulationParameters.arrival_time_calendar = simulationParameters.arrival_time_calendar.map(
    (calendar: { from: string; to: string; beginTime: string; endTime: string }) => {
      return {
        from: makeTitleCase(calendar.from),
        to: makeTitleCase(calendar.to),
        beginTime: removeFractionalTimePart(calendar.beginTime),
        endTime: removeFractionalTimePart(calendar.endTime),
      };
    }
  );

  console.log("simulationParameters", simulationParameters);
  return simulationParameters;
}

function makeTitleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function removeFractionalTimePart(str: string) {
  return str.split(".")[0];
}
