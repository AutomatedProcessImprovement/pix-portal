export interface ModelTask {
    name: string
    resource: string
}

export interface AllModelTasks {
    [id: string]: ModelTask
}

export interface Gateways {
    [gatewayId: string]: GatewayInfo
}

export interface GatewayInfo {
    type: string
    name: string
    childs: SequenceElements
}

export interface SequenceElements {
    [seqId: string]: {
        name: string
    }
}

export class Dictionary<T> {
    items: { [key: string]: T } = {}

    add(key: string, value: T) {
        this.items[key] = value
    }

    remove(key: string) {
        delete this.items[key]
    }

    isEmpty() {
        return Object.keys(this.items).length === 0;
    }

    getValueByKey(key: string) {
        return  (key in this.items) ? this.items[key] : null
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

export class EventDetails {
    name: string

    constructor(init: {name: string}) {
        this.name = init.name
    }
}

export class EventsFromModel extends Dictionary<EventDetails> {
    getNameByKey(key: string) {
        " Returns name or empty string"
        return this.getValueByKey(key)?.name ?? ""
    }
}
