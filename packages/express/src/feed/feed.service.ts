import {
  AdapterAggregate,
  AdapterImportRequest,
  InstrumentSelector,
  now,
  SessionDescriptor,
  Store
} from '@quantform/core';
import { Service } from 'typedi';
import { EventDispatcher } from '../event/event.dispatcher';

@Service()
export class FeedService {
  public static EVENT_STARTED = 'feed-started';
  public static EVENT_UPDATE = 'feed-update';
  public static EVENT_COMPLETED = 'feed-completed';

  constructor(private readonly dispatcher: EventDispatcher) {}

  async import(
    descriptor: SessionDescriptor,
    from: number,
    to: number,
    instrument: InstrumentSelector
  ) {
    this.dispatcher.emit(FeedService.EVENT_STARTED);

    const aggregate = new AdapterAggregate(new Store(), descriptor.adapter());
    await aggregate.initialize(false);

    await aggregate.execute(
      instrument.base.exchange,
      new AdapterImportRequest(
        instrument,
        from,
        Math.min(to, now()),
        descriptor.feed(),
        (timestamp: number) => {
          this.dispatcher.emit(FeedService.EVENT_UPDATE, { timestamp });
        }
      )
    );

    this.dispatcher.emit(FeedService.EVENT_COMPLETED);
  }
}
