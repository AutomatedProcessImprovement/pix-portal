import { Person as PersonIcon, PrecisionManufacturing as PrecisionManufacturingIcon } from "@mui/icons-material";

import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import React from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { ConsParams } from "~/shared/optimos_json_type";

export type ResourceSelectionProps = {
  allCalendars: FieldArrayWithId<ConsParams, "resources", "key">[];
  currCalendarIndex: number;
  updateCurrCalendar: (index: number) => void;
};

export const ResourceSelection: FC<ResourceSelectionProps> = ({
  allCalendars,
  currCalendarIndex,
  updateCurrCalendar,
}) => {
  return (
    <Card
      elevation={5}
      sx={{
        p: 2,
      }}
    >
      <Grid item xs={12}>
        <Typography variant="h6">Resources</Typography>
      </Grid>
      <Grid container direction={"row"} justifyContent={"space-around"} alignItems={"stretch"}>
        <Grid
          item
          xs={5}
          sx={{
            p: 2,
          }}
        >
          <TextField
            sx={{
              width: "100%",
              mb: 1,
            }}
            label="Search"
            type="search"
          />
          <List
            sx={{
              overflow: "scroll",
              maxHeight: "300px",
            }}
          >
            {allCalendars.map((item, index) => {
              const { key } = item;
              const isSelected = currCalendarIndex === index;
              return (
                <ListItemButton selected={isSelected} key={key} onClick={() => updateCurrCalendar(index)}>
                  <ListItemIcon>
                    {item.constraints.global_constraints.is_human ? <PersonIcon /> : <PrecisionManufacturingIcon />}
                  </ListItemIcon>
                  <ListItemText>{item.id}</ListItemText>
                </ListItemButton>
              );
            })}
          </List>
        </Grid>

        <Divider orientation="vertical" flexItem variant="middle" />

        <Grid item xs={5}>
          <Grid container width={"100%"} height={"100%"} justifyContent={"space-between"}>
            <Grid item width={"100%"}>
              <Typography variant="subtitle1">Copy Constraints</Typography>
              <ButtonGroup fullWidth>
                <Button variant="outlined">Apply constraints to all resources</Button>
                <Button variant="outlined">Copy Constraints to...</Button>
              </ButtonGroup>
            </Grid>
            <Divider flexItem variant="middle" orientation="horizontal" />
            <Grid item width={"100%"}>
              <Typography variant="subtitle1">Reset Constraints</Typography>
              <ButtonGroup orientation="vertical" fullWidth>
                <Button variant="outlined">Reset Resource to blank constraints</Button>
                <Button variant="outlined">Reset Resources to 9-5 Working times</Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};
