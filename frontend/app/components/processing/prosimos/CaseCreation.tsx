import { yupResolver } from "@hookform/resolvers/yup";
import { CaseCreationDistributionParametersInputs } from "./CaseCreationDistributionParametersInputs";
import { CustomForm } from "./CustomForm";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "./CustomSelect";
import { DistributionType } from "./distribution-constants";
import { caseCreationSchema } from "./form-schema";

export function CaseCreation() {
  function onSubmit(data: any) {
    console.log("data", data);
  }

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

  return (
    <>
      <CustomForm
        onSubmit={onSubmit}
        className="flex flex-col space-y-2"
        defaultValues={{}}
        resolver={yupResolver(caseCreationSchema)}
      >
        <h3 className="text-lg font-semibold">Scenario Specification</h3>
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
        <button type="submit">Submit</button>
      </CustomForm>
    </>
  );
}
