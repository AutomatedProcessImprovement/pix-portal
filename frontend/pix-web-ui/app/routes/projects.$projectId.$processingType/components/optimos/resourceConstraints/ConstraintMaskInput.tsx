import { type FC } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Card, Grid, Typography } from "@mui/material";
import type { ConsParams } from "~/shared/optimos_json_type";
import { BLANK_CONSTRAINTS } from "../helpers";
import { ConstraintCalendar, type DAYS } from "./ConstraintCalendar";

interface Props {
  constraintsForm: UseFormReturn<ConsParams, object>;
  index: number;
}
export const ConstraintMaskInput: FC<Props> = (props) => {
  const { constraintsForm, index } = props;

  const constraints = useWatch({ control: constraintsForm.control, name: `resources.${index}.constraints` });

  const createOnSelectChange =
    (column: "never_work_masks" | "always_work_masks") => (selection: Array<HTMLElement | SVGElement>) => {
      const constraintsEntries = selection.map((element) => {
        const index = parseInt(element.dataset.index!);

        const day = element.dataset.day as (typeof DAYS)[number];
        return { index, column, day };
      });

      // Group by column, then day
      const newConstraints = constraintsEntries.reduce(
        (acc, { index, column, day }) => {
          return {
            ...acc,
            [column]: { ...acc[column], [day]: acc[column]?.[day] | (1 << index) },
          };
        },
        { ...BLANK_CONSTRAINTS }
      );
      constraintsForm.setValue(`resources.${index}.constraints`, { ...constraints, ...newConstraints });
    };

  return (
    <>
      <Card elevation={5} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" align="left">
              Always Work Times
            </Typography>
          </Grid>
          <ConstraintCalendar
            prefix={`always`}
            workMask={constraints?.always_work_masks}
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
            </Typography>
          </Grid>
          <ConstraintCalendar
            prefix={`never`}
            workMask={constraints?.never_work_masks}
            onSelectChange={createOnSelectChange("never_work_masks")}
            color="rgb(242, 107, 44,0.5)"
          />
        </Grid>
      </Card>
    </>
  );
};
