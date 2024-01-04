# PIX Portal

![version](https://img.shields.io/github/v/tag/AutomatedProcessImprovement/pix-portal)

The project is a suite of applications that provide a single point of entry for users to access the various services provided by the PIX platform:

- Business process simulation model discovery
- Simulation
- Waiting time analysis

## Architecture

```mermaid
flowchart TD
    proxy --> pix-web-ui & kronos-web-ui
    pix-web-ui --> pix-api ---> queue[[queue]]
    queue ---> simod-worker -.->|download and upload| pix-api
    queue ---> prosimos-worker -.->|download and upload| pix-api
    queue ---> kronos-worker -.->|download and upload| pix-api
    kronos-worker -.->|create table| kronos-http
    kronos-web-ui ---> kronos-http
    pix-api --> pixdb[(db)]
    kronos-http --> kronosdb[(db)]
```
