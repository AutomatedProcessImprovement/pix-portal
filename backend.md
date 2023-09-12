# Back-End

## Architecture

### Hybrid approach

Monolithical web server with background jobs and external services:

```mermaid
flowchart LR
    Frontend --> Gateway[API Gateway]
    Gateway --> Controllers

    subgraph backend[Backend]
        subgraph Web[Web Server]
            Controllers
            Auth[Auth Service]
            Users[Users Service]
            Projects[Projects Service]
            Assets[Assets Service]
            Storage[Storage Service]

            Auth --> AuthImpl[Auth Implementation]
            Users --> UsersImpl[Users Implementation]
            Projects --> ProjectsImpl[Projects Implementation]
            Assets --> AssetsImpl[Assets Implementation]
            Assets --> Storage
            Storage --> FileStorageImpl[File Storage Implementation]
            Storage --> BlobStorageImpl[Blob Storage Implementation]
            Storage --> EtcImpl[...]

            AuthImpl --> UtilitiesDB[(Utilities DB)]
            UsersImpl --> UtilitiesDB
            ProjectsImpl --> UtilitiesDB
            AssetsImpl --> UtilitiesDB

            FileStorageImpl --> FileStorage[(File Storage)]

            BlobStorageImpl --> BlobStorage[(Blob Storage)]

            Controllers --> Auth
            Controllers --> Users
            Controllers --> Projects
            Controllers --> Assets
        end

        subgraph BackgroundServices[Background Services]
            DiscoverJob[BPS Discovery Batch Job]
            SimulationJob[Simulation Batch Job]
            WTAJob[Waiting Time Analysis Batch Job]

            Controllers ---> DiscoverJob
            Controllers ---> SimulationJob
            Controllers ---> WTAJob
        end
    end

    subgraph ExternalServices[External Services]
        Notifications[Notifications Service]
        Discovery[BPS Discovery Service]
        Simulation[Simulation Service]
        WTA[WTA Service]
        
        DiscoverJob ---> Discovery
        DiscoverJob ---> Assets
        DiscoverJob ---> Notifications

        SimulationJob ---> Simulation
        SimulationJob ---> Assets
        SimulationJob ---> Notifications

        WTAJob ---> WTA
        WTAJob ---> Assets
        WTAJob --> Notifications
    end
```

### Event-driven approach using microservices

```mermaid
flowchart LR
    Frontend --> Gateway[API Gateway]
    Gateway --> Controllers

    subgraph Web[Web Server]
        Controllers
    end

    Controllers --> Auth
    Controllers --> Users
    Controllers --> Projects
    Controllers --> Assets

    subgraph Broker[Message Topics]
        BPSDiscoveryRequestTopic[[BPS Discovery Request Topic]]
        BPSDiscoveryResultTopic[[BPS Discovery Result Topic]]
        NotificationRequestTopic[[Notification Request Topic]]

        Controllers -- publish ---> BPSDiscoveryRequestTopic
    end

    subgraph Processors[Topic Processors]
        BPSDiscoveryRequestProcessor -- subscribes --> BPSDiscoveryRequestTopic
        BPSDiscoveryRequestProcessor -- publishes --> BPSDiscoveryResultTopic
        
        BPSDiscoveryResultProcessor -- subscribes --> BPSDiscoveryResultTopic
        BPSDiscoveryResultProcessor -- publishes --> NotificationRequestTopic

        NotificationProcessor -- subscribes --> NotificationRequestTopic
    end

    BPSDiscoveryRequestProcessor -- uses ---> Simod
    BPSDiscoveryRequestProcessor -- uses ---> Assets
    BPSDiscoveryResultProcessor -- uses ---> Assets
    NotificationProcessor -- uses ---> Notifications

    Assets -- uses --> Storage
```

- Control the number of concurrently running batch processes
- Distribute batch processes across multiple machines (e.g., BPS discovery on several machines, simulation on several machines, etc.)
- Should each processor call an external service or should it use the underlying tool directly?

## Waiting Time Analysis

### Workflow

```mermaid
flowchart LR
    UploadLog[Upload a log] --> RunWTA[Run WTA]
    RunWTA --> ExamineWTAReport[Examine WTA report]
    RunWTA --> DiscoverBPSModel[Discover BPS model]
    DiscoverBPSModel --> SimulateBPSModel[Simulate BPS model]
    SimulateBPSModel --> ExamineSimulationReport[Examine simulation report]
    ExamineSimulationReport --> ModifySimulationScenario[Modify simulation scenario]
    ModifySimulationScenario --> SimulateBPSModel

```

### File upload sequence diagram

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Assets
    participant Projects
    participant WaitingTimeAnalysis
    participant Simulation
    participant BPSDiscovery
    participant Notifications

    User ->> Frontend: upload event log
    Frontend ->> Backend: upload event log
    Backend ->> Projects: get project
    Projects -->> Backend: project
    Backend ->> Assets: upload event log
    Assets -->> Backend: event log uploaded
    Backend -->> Frontend: event log uploaded
    Frontend -->> User: event log uploaded
```

### Analysis sequence diagram

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Assets
    participant Projects
    participant WaitingTimeAnalysis
    participant Simulation
    participant BPSDiscovery
    participant Notifications

    User ->> Frontend: run WTA on event log
    Frontend ->> Backend: run WTA on event log
    Backend -->> Frontend: WTA accepted
    Frontend -->> User: WTA accepted
    Backend ->> Assets : get event log
    Assets -->> Backend: event log
    Backend ->> WaitingTimeAnalysis: run analysis on event log
    activate WaitingTimeAnalysis
    WaitingTimeAnalysis -->> Backend: analysis finished
    deactivate WaitingTimeAnalysis
    Backend ->> Assets: save analysis results
    Assets -->> Backend: analysis results saved
    Backend -->> Frontend: analysis finished
    Backend ->> Notifications: send notification
    activate Notifications
    Notifications -->> Backend: notification sent
    deactivate Notifications
```
