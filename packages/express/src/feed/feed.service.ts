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
    instrument: InstrumentSelector
  ) {
    this.dispatcher.emit('hey', new FeedStartedEvent());

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
          this.dispatcher.emit('hey', new FeedUpdateEvent());
        }
      )
    );

    this.dispatcher.emit('hey', new FeedCompletedEvent());
  }
}
