"use client";

import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React, { Suspense, useEffect, useState } from "react";
import { fetchBackend } from "../helpers/useFetchData";

const Overview = React.lazy(() => import("./dashboard/overview/Overview"));
const Batching = React.lazy(() => import("./dashboard/batching/Batching"));
const Prioritization = React.lazy(() => import("./dashboard/prioritization/Prioritization"));
const Contention = React.lazy(() => import("./dashboard/contention/Contention"));
const Unavailability = React.lazy(() => import("./dashboard/unavailability/Unavailability"));
const Extraneous = React.lazy(() => import("./dashboard/extraneous/Extraneous"));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ActivityPair {
  destination_activity: string;
  source_activity: string;
}

const useFetchActivityPairs = (jobId: string) => {
  const [activityPairs, setActivityPairs] = useState<ActivityPair[]>([]);
  useEffect(() => {
    (async () => {
      const data = await fetchBackend(`/activity_pairs/${jobId}`);
      setActivityPairs(data as ActivityPair[]);
    })();
  }, [jobId]);
  return activityPairs;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  const isHidden = value !== index;

  return (
    <div
      role="tabpanel"
      hidden={isHidden}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 3, display: isHidden ? "none" : "block" }}>{children}</Box>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ActivityPairSelector = ({ selectedActivityPair, handleActivityPairChange, activityPairs }: any) => (
  <FormControl variant="outlined" size="small">
    <InputLabel htmlFor="activity-pair-selector">Activity Pair</InputLabel>
    <Select
      label="Activity Pair"
      id="activity-pair-selector"
      value={selectedActivityPair}
      onChange={handleActivityPairChange}
    >
      <MenuItem value="All transitions">All transitions</MenuItem>
      {activityPairs.map((pair: ActivityPair, index: number) => (
        <MenuItem key={index} value={`${pair.source_activity} - ${pair.destination_activity}`}>
          {`${pair.source_activity} - ${pair.destination_activity}`}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const Dashboard = ({ jobId }: { jobId: string }) => {
  const [value, setValue] = useState(0);
  const [selectedActivityPair, setSelectedActivityPair] = useState<string>("All transitions");
  const activityPairsData = useFetchActivityPairs(jobId);

  if (!activityPairsData) {
    return <div>Loading...</div>;
  }
  const activityPairs = activityPairsData;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleActivityPairChange = (event: SelectChangeEvent) => {
    setSelectedActivityPair(event.target.value as string);
  };

  const sortedActivityPairs = [...activityPairs].sort((a, b) => {
    const nameA = `${a.source_activity} - ${a.destination_activity}`;
    const nameB = `${b.source_activity} - ${b.destination_activity}`;
    return nameA.localeCompare(nameB);
  });

  return (
    <Box sx={{ width: "100%", mt: 1, zIndex: 100000 }}>
      <Box>
        <Grid container spacing={3} alignItems={"stretch"} justifyContent="space-around" direction="row">
          <Grid item>
            {/* Activity Pair Selector */}
            <ActivityPairSelector
              selectedActivityPair={selectedActivityPair}
              handleActivityPairChange={handleActivityPairChange}
              activityPairs={sortedActivityPairs}
            />
          </Grid>
          <Grid item>
            <Tabs value={value} onChange={handleChange} aria-label=" ">
              <Tab label="Overview" {...a11yProps(0)} />
              <Tab label="Batching" {...a11yProps(1)} />
              <Tab label="Prioritization" {...a11yProps(2)} />
              <Tab label="Resource Contention" {...a11yProps(3)} />
              <Tab label="Resource Unavailability" {...a11yProps(4)} />
              <Tab label="Extraneous Factors" {...a11yProps(5)} />
            </Tabs>
          </Grid>
        </Grid>
      </Box>
      <Suspense fallback={<div>Loading...</div>}>
        {value === 0 && (
          <TabPanel value={value} index={0}>
            <Overview jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
        {value === 1 && (
          <TabPanel value={value} index={1}>
            <Batching jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
        {value === 2 && (
          <TabPanel value={value} index={2}>
            <Prioritization jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
        {value === 3 && (
          <TabPanel value={value} index={3}>
            <Contention jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
        {value === 4 && (
          <TabPanel value={value} index={4}>
            <Unavailability jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
        {value === 5 && (
          <TabPanel value={value} index={5}>
            <Extraneous jobId={jobId} selectedActivityPair={selectedActivityPair} />
          </TabPanel>
        )}
      </Suspense>
    </Box>
  );
};

export default Dashboard;
