export class FeedStartedEvent {
  type = FeedStartedEvent.name;
}

export class FeedUpdateEvent {
  type = FeedUpdateEvent.name;

  constructor(readonly from: number, readonly to: number, readonly timestamp: number) {}
}

export class FeedCompletedEvent {
  type = FeedCompletedEvent.name;
}
