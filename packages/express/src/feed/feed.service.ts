import {
  AdapterAggregate,
  AdapterImportRequest,
  instrumentOf,
  now,
  Store
} from '@quantform/core';
import { SessionDescriptorRegistry } from '../session/session-descriptor.registry';
import { Service } from 'typedi';
import { EventDispatcher } from '../event/event.dispatcher';

@Service()
export class FeedService {
  constructor(
    private readonly dispatcher: EventDispatcher,
    private readonly registry: SessionDescriptorRegistry
  ) {}

  async import(name: string, from: number, to: number, instrument: string) {
    const descriptor = this.registry.resolve(name);
    const ins = instrumentOf(instrument);

    const aggregate = new AdapterAggregate(new Store(), descriptor.adapter());
    await aggregate.initialize(false);

    this.dispatcher.emit('feed-started');

    const progress = (timestamp: number) => {
      this.dispatcher.emit('feed-progress', { timestamp });
    };

    aggregate
      .execute(
        ins.base.exchange,
        new AdapterImportRequest(
          ins,
          from,
          Math.min(to, now()),
          descriptor.feed(),
          progress
        )
      )
      .then(() => this.dispatcher.emit('feed-completed'));
  }
}
