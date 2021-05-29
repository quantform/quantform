import {
  AdapterAggregate,
  Session,
  SessionDescriptor,
  SessionFactory,
  Store
} from '@quantform/core';
import { EventDispatcher } from '../event/event.dispatcher';
import { Service } from 'typedi';
import {
  SessionCompletedEvent,
  SessionStartedEvent,
  SessionUpdateEvent
} from './session.event';

@Service()
export class SessionService {
  constructor(private readonly dispatcher: EventDispatcher) {}

  async universe(descriptor: SessionDescriptor) {
    const store = new Store();

    const aggregate = new AdapterAggregate(store, descriptor.adapter());
    await aggregate.initialize(false);
    await aggregate.dispose();

    return {
      instruments: Object.keys(store.snapshot.universe.instrument).sort()
    };
  }

  async backtest(
    descriptor: SessionDescriptor,
    from: number,
    to: number,
    context: string
  ) {
    this.dispatcher.emit(context, new SessionStartedEvent());

    const options = {
      from,
      to,
      balance: {
        'binance:usdt': 100
      }
    };

    const session = await new Promise<Session>(async resolve => {
      const session = SessionFactory.backtest(descriptor, {
        ...options,
        progress: (timestamp: number) =>
          this.dispatcher.emit(context, new SessionUpdateEvent(from, to, timestamp)),
        completed: () => resolve(session)
      });

      await descriptor.awake(session);
      await session.initialize();
    });

    const statement = {};

    session.statement(statement);

    await descriptor.dispose(session);
    await session.dispose();

    this.dispatcher.emit(context, new SessionCompletedEvent(statement));
  }

  async paper(descriptor: SessionDescriptor, context: string) {
    this.dispatcher.emit(context, new SessionStartedEvent());

    const options = {
      balance: {
        'binance:usdt': 100
      }
    };

    const session = SessionFactory.paper(descriptor, options);

    await descriptor.awake(session);
    await session.initialize();
  }

  async real(descriptor: SessionDescriptor, context: string) {
    this.dispatcher.emit(context, new SessionStartedEvent());

    const session = SessionFactory.real(descriptor);

    await descriptor.awake(session);
    await session.initialize();
  }
}
