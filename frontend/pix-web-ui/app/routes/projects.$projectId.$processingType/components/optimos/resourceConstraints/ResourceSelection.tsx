import {
  Person as PersonIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  ContentPaste as ContentPasteIcon,
  ContentPasteGo as ContentPasteGoIcon,
  RestartAlt as RestartAltIcon,
  Event as EventIcon,
} from "@mui/icons-material";

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
import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ResourceCopyDialog } from "./ResourceCopyDialog";
import {
  applyConstraintsToResources,
  resetResourceConstraintsToBlank,
  resetResourceConstraintsToNineToFive,
} from "../helpers";
import type { MasterFormData } from "../hooks/useMasterFormData";

export type ResourceSelectionProps = {
  currCalendarIndex: number;
  updateCurrCalendar: (index: number) => void;
};

export const ResourceSelection: FC<ResourceSelectionProps> = ({ currCalendarIndex, updateCurrCalendar }) => {
  const form = useFormContext<MasterFormData>();
  const resources = useWatch({
    control: form.control,
    name: "constraints.resources",
    defaultValue: [],
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState(resources);
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    const results = resources.filter((calendar) => calendar.id.toLowerCase().includes(searchTerm.toLowerCase()));
    setSearchResults(results);
  }, [resources, searchTerm]);

  return (
    <>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <List
              sx={{
                overflowY: "scroll",
                height: "300px",
              }}
            >
              {searchResults.map((item, index) => {
                const isSelected = currCalendarIndex === index;
                return (
                  <ListItemButton selected={isSelected} key={item.id} onClick={() => updateCurrCalendar(index)}>
                    <ListItemIcon>
                      {item.constraints.global_constraints?.is_human ? <PersonIcon /> : <PrecisionManufacturingIcon />}
                    </ListItemIcon>
                    <ListItemText>{item.id}</ListItemText>
                  </ListItemButton>
                );
              })}
            </List>
          </Grid>

          <Divider orientation="vertical" flexItem variant="middle" />

          <Grid item container xs={5} justifyContent={"center"} alignItems={"center"}>
            <Grid container width={"100%"} height={"80%"} justifyContent={"center"} alignItems={"center"}>
              <Grid item width={"100%"}>
                <Typography variant="caption">COPY CONSTRAINTS</Typography>
                <ButtonGroup fullWidth>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const newResources = applyConstraintsToResources(
                        resources,
                        resources[currCalendarIndex].id,
                        resources.map((r) => r.id)
                      );
                      form.setValue("constraints.resources", newResources, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    startIcon={<ContentPasteIcon />}
                  >
                    Apply to All
                  </Button>
                  <Button variant="outlined" onClick={() => setModalOpen(true)} startIcon={<ContentPasteGoIcon />}>
                    Copy to...
                  </Button>
                </ButtonGroup>
              </Grid>
              {/* <Grid item alignSelf={"center"} width={"80%"}>
                <Divider variant="middle" orientation="horizontal" />
              </Grid> */}
              <Grid item width={"100%"}>
                <Typography variant="caption">RESET CONSTRAINTS</Typography>
                <ButtonGroup orientation="vertical" fullWidth>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={() => {
                      const newResources = resetResourceConstraintsToBlank(resources, resources[currCalendarIndex].id);
                      form.setValue("constraints.resources", newResources, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    Reset to blank constraints
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => {
                      const newResources = resetResourceConstraintsToNineToFive(
                        resources,
                        resources[currCalendarIndex].id
                      );

                      form.setValue("constraints.resources", newResources, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    Reset to 9-5 working times
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <ResourceCopyDialog
        open={modalOpen}
        onClose={(selectedIds) => {
          setModalOpen(false);
          const newResources = applyConstraintsToResources(resources, resources[currCalendarIndex].id, selectedIds);
          form.setValue("constraints.resources", newResources, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
        selectedValue={resources[currCalendarIndex].id}
        resources={resources}
      />
    </>
  );
};