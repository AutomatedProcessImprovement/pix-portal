import type { ValidationError } from "yup";
import { prosimosConfigurationSchema, type ProsimosConfiguration } from "./schema";
import { formatDate } from "./shared";

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

export async function parseSimulationParameters(
  jsonBlob: Blob
): Promise<[ProsimosConfiguration | null, ValidationError | null]> {
  const jsonStr = await jsonBlob.text();
  const json = JSON.parse(jsonStr);

  let simulationParameters: ProsimosConfiguration;
  try {
    simulationParameters = await prosimosConfigurationSchema.validate(json);
  } catch (e) {
    return [null, e as ValidationError];
  }

  simulationParameters.start_time = formatDate(new Date(simulationParameters.start_time));

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
  return [simulationParameters, null];
}

function postProcessCalendarPeriod(calendarPeriod: CalendarPeriod) {
  return {
    from: calendarPeriod.from.toUpperCase(),
    to: calendarPeriod.to.toUpperCase(),
    beginTime: removeFractionalTimePart(calendarPeriod.beginTime),
    endTime: removeFractionalTimePart(calendarPeriod.endTime),
  };
}

function removeFractionalTimePart(str: string) {
  return str.split(".")[0];
}
