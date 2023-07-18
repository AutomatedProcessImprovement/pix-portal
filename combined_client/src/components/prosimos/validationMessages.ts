export const REQUIRED_ERROR_MSG = "Cannot be empty"
export const SUMMATION_ONE_MSG = "Sum should be equal to 1"
export const RESOURCE_ALLOCATION_DUPLICATES_MSG = "Resources should be unique"
export const MIN_LENGTH_REQUIRED_MSG = (entity_name: string) => {
    return `At least one ${entity_name} should be defined`
}
export const SHOULD_BE_NUMBER_MSG = "Should be a number"
export const SHOULD_BE_GREATER_0_MSG = "Should be greater than 0"
export const INVALID_TIME_FORMAT = "Invalid time"

export const UNIQUE_KEYS = (entity_name: string) => {
    return `${entity_name} should be unique`
}
