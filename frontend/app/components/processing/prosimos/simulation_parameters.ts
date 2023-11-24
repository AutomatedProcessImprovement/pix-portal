import { prosimosConfigurationSchema } from "./schema";

type CalendarPeriod = {
  from: string;
  to: string;
  beginTime: string;
  endTime: string;
};

type NamedEntity = {
  id: string;
  name: string;
};

export async function parseSimulationParameters(jsonBlob: Blob) {
  const jsonStr = await jsonBlob.text();
  const json = JSON.parse(jsonStr);
  let simulationParameters = await prosimosConfigurationSchema.validate(json);

  simulationParameters.arrival_time_calendar =
    simulationParameters.arrival_time_calendar.map(postProcessCalendarPeriod);

  simulationParameters.resource_calendars = simulationParameters.resource_calendars.map(
    (calendar: NamedEntity & { time_periods: CalendarPeriod[] }) => {
      return {
        ...calendar,
        time_periods: calendar.time_periods.map(postProcessCalendarPeriod),
      };
    }
  );

  console.log("simulationParameters", simulationParameters);
  return simulationParameters;
}

function postProcessCalendarPeriod(calendarPeriod: CalendarPeriod) {
  return {
    from: makeTitleCase(calendarPeriod.from),
    to: makeTitleCase(calendarPeriod.to),
    beginTime: removeFractionalTimePart(calendarPeriod.beginTime),
    endTime: removeFractionalTimePart(calendarPeriod.endTime),
  };
}

function makeTitleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function removeFractionalTimePart(str: string) {
  return str.split(".")[0];
}
