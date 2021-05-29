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
import { FeedCompletedEvent, FeedStartedEvent, FeedUpdateEvent } from './feed.event';

@Service()
export class FeedService {
  constructor(private readonly dispatcher: EventDispatcher) {}

  async import(
    descriptor: SessionDescriptor,
    from: number,
    to: number,
    instrument: InstrumentSelector,
    context: string
  ) {
    this.dispatcher.emit(context, new FeedStartedEvent());

    const aggregate = new AdapterAggregate(new Store(), descriptor.adapter());
    await aggregate.initialize(false);

    await aggregate.execute(
      instrument.base.exchange,
      new AdapterImportRequest(
        instrument,
        from,
        to,
        descriptor.feed(),
        (timestamp: number) => {
          this.dispatcher.emit(context, new FeedUpdateEvent(from, to, timestamp));
        }
      )
    );

    this.dispatcher.emit(context, new FeedCompletedEvent());
  }
}
