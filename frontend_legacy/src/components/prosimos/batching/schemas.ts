import { CaseBasedRule } from "../formData"

const GREATER_THAN = "Greater Than"
const GREATER_THAN_OR_EQUALS = "Greater Than or Equal To"
export const EQUALS = "Equals"
const LESS_THAN = "Less Than"
const LESS_THAN_OR_EQUALS = "Less Than or Equal To"
const BETWEEN = "Between"

export const typeOperatorMap = {
  size: {
    ">": {
      label: GREATER_THAN
    },
    ">=": {
      label: GREATER_THAN_OR_EQUALS
    },
    "=": {
      label: EQUALS
    },
    "<": {
      label: LESS_THAN
    },
    "<=": {
      label: LESS_THAN_OR_EQUALS
    }
  },
  waiting_time: {
    "=": {
      label: EQUALS
    },
    "between": {
      label: BETWEEN,
      multiple: true
    }
  },
  hour: {
    "=": {
      label: EQUALS
    },
    "between": {
      label: BETWEEN,
      multiple: true
    },
  },
  weekday: {
    "=": {
      label: EQUALS
    }
  },
  priority_continuous: {
    "<=": {
      label: LESS_THAN_OR_EQUALS
    },
    "=": {
      label: EQUALS
    },
    ">=": {
      label: GREATER_THAN_OR_EQUALS
    },
    "in": {
      label: BETWEEN,
      multiple: true
    },
  },
  priority_discrete: {
    "=": {
      label: EQUALS
    },
  }
};

type QueryBuilderSchema<T> = {
  [key: string]: {
    label: string;
    type: T;
  };
};

const BATCH_SIZE_PROP_NAME = "size"

type BatchingRuleTypes = "size" | "waiting_time" | "hour" | "weekday" | "priority"
type BatchingBuilderSchema = QueryBuilderSchema<BatchingRuleTypes>

type PrioritisationRuleTypes = string // every string is eligible because case attributes' names are dynamic
export type PrioritisationBuilderSchema = QueryBuilderSchema<PrioritisationRuleTypes>

export type EligibleBuilderSchemas = BatchingBuilderSchema | PrioritisationBuilderSchema

export const batchingSchema: BatchingBuilderSchema = {
  size: {
    label: "Batch size",
    type: BATCH_SIZE_PROP_NAME
  },
  large_wt: {
    label: "Time since first",
    type: "waiting_time"
  },
  ready_wt: {
    label: "Time since last",
    type: "waiting_time"
  },
  daily_hour: {
    label: "Hour of the day",
    type: "hour"
  },
  week_day: {
    label: "Day of the week",
    type: "weekday"
  }
};

const getDefaultOption = (builderSchema: EligibleBuilderSchemas): [string, string] => {
  // returns (attrName, attrType)
  const sizeProp = BATCH_SIZE_PROP_NAME in builderSchema
  if (sizeProp) {
    return [BATCH_SIZE_PROP_NAME, builderSchema[BATCH_SIZE_PROP_NAME].type]
  }

  // else find a first case attribute in the array
  // and select it as a default one
  const caseAttrProp = Object.entries(builderSchema)[0]
  return [caseAttrProp[0], caseAttrProp[1].type]
}

const getComparison = (attrName: string) => {
  const possibleOptions = (typeOperatorMap as any)[attrName]
  const isEqualExist = "=" in possibleOptions
  if (isEqualExist) {
    return "="
  } else {
    // in case EQUALS operator is not available for the attribute
    // we select the first one in the list of all available operators for this attribute
    const firstFoundOperator = Object.keys(possibleOptions)[0]
    return firstFoundOperator ?? ""
  }
}

export const getRuleStatementsWithDefaultValues = (builderSchema: EligibleBuilderSchemas): CaseBasedRule[] => {
  // ATTR: either batch_size for batching
  // or first case attr in the schema for prioritisation
  //
  // COMPARISON: either EQUALS or the first one available in the list
  const [defaultAttrProp, attrType] = getDefaultOption(builderSchema)
  const comparison = getComparison(attrType)
  const condition = [
    { attribute: defaultAttrProp, comparison: comparison, value: [] } as CaseBasedRule,
  ]

  return condition
}

export const isSchemaNotEmpty = (schema: PrioritisationBuilderSchema) => {
  // verifying that at least one case attribute is defined
  return Object.keys(schema).length > 0
}