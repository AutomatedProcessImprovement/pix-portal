interface IColumnMapping {
  case: string;
  activity: string;
  resource: string;
  start_time: string;
  end_time: string;
}

export class EventLogColumnMapping {
  // pix-framework expects column names to be in snake_case
  case: string;
  activity: string;
  resource: string;
  start_time: string;
  end_time: string;

  constructor(source: IColumnMapping) {
    this.case = source.case;
    this.activity = source.activity;
    this.resource = source.resource;
    this.start_time = source.start_time;
    this.end_time = source.end_time;
  }

  static default(): EventLogColumnMapping {
    return new EventLogColumnMapping({
      case: "case",
      activity: "activity",
      resource: "resource",
      start_time: "start_time",
      end_time: "end_time",
    });
  }

  setValue(column: string, value: string) {
    switch (column) {
      case "case":
        this.case = value;
        break;
      case "activity":
        this.activity = value;
        break;
      case "resource":
        this.resource = value;
        break;
      case "start_time":
        this.start_time = value;
        break;
      case "end_time":
        this.end_time = value;
        break;
    }
  }

  isValid(): boolean {
    return (
      this.case !== undefined &&
      this.case.length > 0 &&
      this.activity !== undefined &&
      this.activity.length > 0 &&
      this.resource !== undefined &&
      this.resource.length > 0 &&
      this.start_time !== undefined &&
      this.start_time.length > 0 &&
      this.end_time !== undefined &&
      this.end_time.length > 0
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
