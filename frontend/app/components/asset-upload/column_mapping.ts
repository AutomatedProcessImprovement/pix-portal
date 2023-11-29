interface IColumnMapping {
  caseId: string;
  activity: string;
  resource: string;
  startTimestamp: string;
  endTimestamp: string;
}

export class EventLogColumnMapping {
  caseId: string;
  activity: string;
  resource: string;
  startTimestamp: string;
  endTimestamp: string;

  constructor(source: IColumnMapping) {
    this.caseId = source.caseId;
    this.activity = source.activity;
    this.resource = source.resource;
    this.startTimestamp = source.startTimestamp;
    this.endTimestamp = source.endTimestamp;
  }

  static default(): EventLogColumnMapping {
    return new EventLogColumnMapping({
      caseId: "case",
      activity: "activity",
      resource: "resource",
      startTimestamp: "start_time",
      endTimestamp: "end_time",
    });
  }

  setValue(column: string, value: string) {
    switch (column) {
      case "caseId":
        this.caseId = value;
        break;
      case "activity":
        this.activity = value;
        break;
      case "resource":
        this.resource = value;
        break;
      case "startTimestamp":
        this.startTimestamp = value;
        break;
      case "endTimestamp":
        this.endTimestamp = value;
        break;
    }
  }

  isValid(): boolean {
    return (
      this.caseId.length > 0 &&
      this.activity.length > 0 &&
      this.resource.length > 0 &&
      this.startTimestamp.length > 0 &&
      this.endTimestamp.length > 0
    );
  }

  toString(): string {
    return JSON.stringify(this);
  }

  static fromString(json: string): EventLogColumnMapping {
    const obj = JSON.parse(json);
    return new EventLogColumnMapping(obj);
  }
}
