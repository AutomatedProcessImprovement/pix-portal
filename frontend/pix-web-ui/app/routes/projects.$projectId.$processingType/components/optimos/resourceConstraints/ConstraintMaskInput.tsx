import { type FC } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button, Card, Grid, Typography } from "@mui/material";
import type { ConsParams } from "~/shared/optimos_json_type";
import { BLANK_CONSTRAINTS } from "../helpers";
import { ConstraintCalendar, type DAYS } from "./ConstraintCalendar";

import type { MasterFormData } from "../hooks/useMasterFormData";
import { useSimParamsResourceIndex, useSimParamsWorkTimes } from "../hooks/useSimParamsWorkTimes";

interface Props {
  index: number;
}
export const ConstraintMaskInput: FC<Props> = (props) => {
  const { index } = props;
  const form = useFormContext<MasterFormData>();

  const never_work_masks = useWatch({
    control: form.control,
    name: `constraints.resources.${index}.constraints.never_work_masks`,
  });
  const always_work_masks = useWatch({
    control: form.control,
    name: `constraints.resources.${index}.constraints.always_work_masks`,
  });

  const id = useWatch({ control: form.control, name: `constraints.resources.${index}.id` });

  const createOnSelectChange =
    (column: "never_work_masks" | "always_work_masks") => (selection: Array<HTMLElement | SVGElement>) => {
      const constraintsEntries = selection.map((element) => {
        const index = parseInt(element.dataset.index!);

        const day = element.dataset.day as (typeof DAYS)[number];
        return { index, day };
      });

      console.log("workHours monday entries", constraintsEntries);

      // Group by column, then day
      const newConstraints = constraintsEntries.reduce(
        (acc, { index, day }) => ({ ...acc, [day]: acc[day] | (1 << (23 - index)) }),
        { ...BLANK_CONSTRAINTS[column] }
      );

      form.setValue(`constraints.resources.${index}.constraints.${column}`, newConstraints, {
        shouldValidate: true,
      });
    };

  return (
    <>
      <Card elevation={5} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" align="left">
              Always Work Times
              <Button
                onClick={() => {
                  form.setValue(
                    `constraints.resources.${index}.constraints.always_work_masks`,
                    BLANK_CONSTRAINTS["always_work_masks"]
                  );
                }}
              >
                <Typography variant="body2">Clear</Typography>
              </Button>
            </Typography>
          </Grid>
          <ConstraintCalendar
            field={`always_work_masks`}
            resourceId={id}
            onSelectChange={createOnSelectChange("always_work_masks")}
            color="lightblue"
          />
        </Grid>
      </Card>

      <Card elevation={5} sx={{ p: 2, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" align="left">
              Never Work Times
              <Button
                onClick={() => {
                  form.setValue(
                    `constraints.resources.${index}.constraints.never_work_masks`,
                    BLANK_CONSTRAINTS["never_work_masks"]
                  );
                }}
              >
                <Typography variant="body2">Clear</Typography>
              </Button>
            </Typography>
          </Grid>
          <ConstraintCalendar
            resourceId={id}
            field={`never_work_masks`}
            onSelectChange={createOnSelectChange("never_work_masks")}
            color="rgb(242, 107, 44,0.5)"
          />
        </Grid>
      </Card>
    </>
  );
};
