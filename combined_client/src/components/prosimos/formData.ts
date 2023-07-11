export interface JsonData {
    resource_profiles: ResourcePool[]
    arrival_time_distribution: ProbabilityDistribution
    arrival_time_calendar: TimePeriod[]
    gateway_branching_probabilities: GatewayBranchingProbability[]
    task_resource_distribution: TaskResourceDistribution[]
    resource_calendars: ResourceCalendar[]
    event_distribution: EventDistribution[]
    batch_processing: BatchProcessing[]
    case_attributes: CaseAttributeDefinition[]
    prioritisation_rules: PriorityRule[]
}


export interface PriorityRule {
    priority_level: number
    rules: CaseBasedRule[][]
}

export interface CaseBasedRule {
    attribute: string
    comparison: string
    value: number | string | (number | "inf")[]
}

export interface BatchProcessing {
    task_id: string
    type: string
    firing_rules: FiringRule[][]
    size_distrib: BatchDistrib[]
    duration_distrib: BatchDistrib[]
}

export interface BatchDistrib {
    key: string
    value: number
}

export interface FiringRule {
    attribute: string
    comparison: string
    value: string | string[]
}

export interface GatewayBranchingProbability {
    gateway_id: string,
    probabilities: Probability[]
}

export interface Probability {
    path_id: string
    value: number
}

export interface ResourcePool {
    id: string,
    name: string,
    resource_list: ResourceInfo[]
}

export interface ResourceInfo {
    id: string,
    name: string,
    cost_per_hour: number
    amount: number
    calendar: string
    assignedTasks: string[]
}

export interface ProbabilityDistribution {
    distribution_name: string
    distribution_params: { value: number }[]
}

export interface ProbabilityDistributionForResource extends ProbabilityDistribution {
    resource_id: string
}

export interface TimePeriod {
    from: string
    to: string
    beginTime: string
    endTime: string
}

export interface ResourceCalendar {
    id: string
    name: string
    time_periods: TimePeriod[]
}

export interface CalendarMap {
    [key: string]: string
}

export interface ResourceMap {
    [resourceId: string]: {
        name: string
    }
}

export interface TaskResourceDistribution {
    task_id: string
    resources: ProbabilityDistributionForResource[]
}

export interface ScenarioProperties {
    num_processes: number
    start_date: string
}

export interface EventDistribution extends ProbabilityDistribution {
    event_id: string
}

export interface CaseAttributeDefinition {
    name: string
    type: string
    values: any
}
