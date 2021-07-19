export class SessionStartedEvent {
  type = SessionStartedEvent.name;
}

export class SessionUpdateEvent {
  type = SessionUpdateEvent.name;

  constructor(readonly from: number, readonly to: number, readonly timestamp: number) {}
}

export class SessionCompletedEvent {
  type = SessionCompletedEvent.name;

  constructor(readonly statement: Record<string, any>) {}
}
