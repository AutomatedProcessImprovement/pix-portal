import moment from "moment"

export class Dictionary<T> {
    items: Record<string, T> = {}

    add(key: string, value: T) {
        this.items[key] = value
    }

    remove(key: string) {
        delete this.items[key]
    }

    isEmpty() {
        return Object.keys(this.items).length === 0
    }

    getValueByKey(key: string) {
        return key in this.items ? this.items[key] : null
    }

    isKeyExisting(key: string) {
        return Object.keys(this.items).includes(key)
    }

    getAllItems() {
        return this.items
    }

    getAllKeys() {
        return Object.keys(this.items)
    }
}

export const timePeriodToBinary = (
    startTime: string,
    endTime: string,
    delta: number,
    num_slots: number
) => {
    const start_of_day = moment(new Date("1970-01-01T00:00:00"))
    const tp_start = moment(new Date("1970-01-01T" + startTime))
    const tp_end = moment(new Date("1970-01-01T" + endTime))

    let res = ""

    const current = start_of_day
    for (let i = 0; i < num_slots; i++) {
        // TODO: Ask why this condition is ()
        if (current.isBetween(tp_start, tp_end, "minute", "()")) {
            res += "1"
        } else {
            res += "0"
        }
        current.add(delta, "minutes")
        // console.log(current.format('hh:mm:ss'))
    }
    return parseInt(res, 2)
}
