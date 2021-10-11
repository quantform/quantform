import {
  AdapterAggregate,
  AdapterFeedCommand,
  InstrumentSelector,
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
    await aggregate.awake(false);

    await aggregate.dispatch(
      instrument.base.exchange,
      new AdapterFeedCommand(
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
