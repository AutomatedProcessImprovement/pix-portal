import { useFieldArray, useFormContext } from "react-hook-form";
import { CaseCreationDistributionParametersInputs } from "./CaseCreationDistributionParametersInputs";
import CustomFormSection from "./CustomFormSection";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "./CustomSelect";
import { DistributionType } from "./distribution-constants";
import { WeekDay } from "./form-schema";

export function CaseCreation() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "arrival_time_calendar",
  });

  function formatDateForInputValue(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hour = date.getHours();
    const minute = date.getMinutes();

    const monthString = month.toString().padStart(2, "0");
    const dayString = day.toString().padStart(2, "0");

    const hourString = hour.toString().padStart(2, "0");
    const minuteString = minute.toString().padStart(2, "0");

    return `${year}-${monthString}-${dayString}T${hourString}:${minuteString}`;
  }

  function handleAddTime() {
    append({
      from: "Monday",
      to: "Friday",
      beginTime: "09:00",
      endTime: "17:00",
    });
  }

  const weekDays = Object.values(WeekDay);

  return (
    <div className="flex flex-col space-y-4">
      <CustomFormSection title="Scenario Specification">
        <CustomInput name="total_cases" type="number" defaultValue={100} />
        <CustomInput name="start_time" type="datetime-local" defaultValue={formatDateForInputValue(new Date())} />
        <CustomSelect
          name="arrival_time_distribution.distribution_name"
          options={Object.values(DistributionType)}
          defaultValue={DistributionType.expon}
        />
        <CaseCreationDistributionParametersInputs
          name="arrival_time_distribution.distribution_params"
          defaultValue={DistributionType.expon}
        />
      </CustomFormSection>
      <CustomFormSection title="Arrival Time Calendar">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex space-x-2 items-end">
              <CustomSelect name={`arrival_time_calendar[${index}].from`} options={weekDays} label="From" />
              <CustomSelect name={`arrival_time_calendar[${index}].to`} options={weekDays} label="To" />
              <CustomInput
                name={`arrival_time_calendar[${index}].beginTime`}
                type="time"
                defaultValue="09:00"
                label="Begin at"
              />
              <CustomInput
                name={`arrival_time_calendar[${index}].endTime`}
                type="time"
                defaultValue="17:00"
                label="End at"
              />
              <div>
                <button type="button" onClick={() => remove(index)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={handleAddTime}>
          Add time
        </button>
      </CustomFormSection>
    </div>
  );
}
