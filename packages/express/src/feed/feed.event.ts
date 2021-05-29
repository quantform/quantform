export class FeedStartedEvent {
  type = FeedStartedEvent.name;
}

export class FeedUpdateEvent {
  type = FeedUpdateEvent.name;

  constructor(readonly from: number, to: number, timestamp: number) {}
}

export class FeedCompletedEvent {
  type = FeedCompletedEvent.name;
}
