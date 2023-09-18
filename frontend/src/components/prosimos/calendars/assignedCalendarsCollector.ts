import { ResourcePool } from "../formData";

/**
* Collect all unique calendars assigned to a resource in resource profiles
*
* @param {ResourcePool[]} resourceProfiles - array of all defined resource profiles
* @returns {Set<string>} Set of unique calendars name
*/
export const collectAllAssignedCalendars = (resourceProfiles: ResourcePool[]) => {
    const collectedCalendars: Set<string> = new Set()

    for (const profile of resourceProfiles) {
        for (const resource of profile.resource_list) {
            collectedCalendars.add(resource.calendar)
        }
    }

    return collectedCalendars
}
