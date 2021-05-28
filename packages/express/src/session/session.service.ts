import {
  AdapterAggregate,
  Session,
  SessionDescriptor,
  SessionFactory,
  Store
} from '@quantform/core';
import { EventDispatcher } from '../event/event.dispatcher';
import { Service } from 'typedi';

@Service()
export class SessionService {
  public static EVENT_STARTED = 'session-started';
  public static EVENT_UPDATE = 'session-update';
  public static EVENT_COMPLETED = 'session-completed';

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

  async backtest(descriptor: SessionDescriptor, from: number, to: number) {
    this.dispatcher.emit(SessionService.EVENT_STARTED, { from, to });

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
          this.dispatcher.emit(SessionService.EVENT_UPDATE, { timestamp }),
        completed: () => resolve(session)
      });

      await descriptor.awake(session);
      await session.initialize();
    });

    await descriptor.dispose(session);
    await session.dispose();

    this.dispatcher.emit(SessionService.EVENT_COMPLETED);
  }

  async paper(descriptor: SessionDescriptor) {
    this.dispatcher.emit(SessionService.EVENT_STARTED, {});

    const options = {
      balance: {
        'binance:usdt': 100
      }
    };

    const session = SessionFactory.paper(descriptor, options);

    await descriptor.awake(session);
    await session.initialize();
  }
}
