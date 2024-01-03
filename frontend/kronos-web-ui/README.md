# Kronos Web UI

Web UI for Waiting Time Analysis (Kronos).

## Start locally (via npm)

> Please, note that you need to have `Node.js` and `npm` installed on your computer in order to follow these steps. The instructions on how to do that could be found here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#overview

Install all dependencies:

```shell
npm install
npm install --save --legacy-peer-deps  # if you run into issues with the previous command
```

Start the application:

```shell
npm start
```

## Features

- Dashboard overview of results
  - Overview: `Generic information about event log`
  - Transitions `Information about transitions between activities`
  - CTE Impact `Information about Cycle time efficiency impacts`
- Sorting and filtering for tables
- Download of report in CSV and JSON format
- Custom tooltips for most dashboard charts and info boxes
- Heatmap to easily spot improvement opportunities
