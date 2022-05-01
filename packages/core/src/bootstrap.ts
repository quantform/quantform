import {
  AdapterAggregate,
  BacktesterListener,
  BacktesterStreamer,
  createBacktesterAdapterFactory,
  createPaperAdapterFactory,
  DefaultTimeProvider
} from './adapter';
import { Session, SessionDescriptor } from './domain';
import { Cache, Feed, InMemoryStorageFactory } from './storage';
import { Store } from './store';

export class Bootstrap {
  constructor(readonly descriptor: SessionDescriptor) {}

  /**
   * Set session id.
   * @param id session id.
   */
  useSessionId(id?: number): Bootstrap {
    if (id) {
      this.descriptor.id = id;
    }

    return this;
  }

  /**
   *
   * @param from
   * @param to
   */
  useBacktestPeriod(from?: number, to?: number): Bootstrap {
    if (!this.descriptor.simulation) {
      this.descriptor.simulation = {
        balance: {},
        from: undefined,
        to: undefined
      };
    }

    if (from) {
      this.descriptor.simulation.from = from;
    }

    if (to) {
      this.descriptor.simulation.to = to;
    }

    return this;
  }

  /**
   * Starts a new backtest session.
   * @param listener backtest event listener.
   * @returns new session object.
   */
  backtest(listener?: BacktesterListener): [Session, BacktesterStreamer] {
    const store = new Store();
    const { storage } = this.descriptor;
    const feed = new Feed(storage.create('feed'));
    const cache = new Cache(storage.create('cache'));

    const streamer = new BacktesterStreamer(
      store,
      feed,
      this.descriptor.simulation,
      listener
    );

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(it =>
        createBacktesterAdapterFactory(
          createPaperAdapterFactory(it, this.descriptor.simulation),
          streamer
        )
      ),
      streamer.getTimeProvider(),
      store,
      cache
    );

    const session = new Session(store, aggregate, this.descriptor);

    return [session, streamer];
  }

  /**
   * Starts a new paper session.
   * @returns new session object.
   */
  paper(): Session {
    if (!this.descriptor.simulation) {
      this.descriptor.simulation = {
        balance: {},
        from: undefined,
        to: undefined
      };
    }

    if (!this.descriptor.simulation.balance) {
      this.descriptor.simulation.balance = {};
    }

    const store = new Store();
    const storage = this.descriptor.storage ?? new InMemoryStorageFactory();
    const cache = new Cache(storage.create('cache'));

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(it =>
        createPaperAdapterFactory(it, this.descriptor.simulation)
      ),
      DefaultTimeProvider,
      store,
      cache
    );

    return new Session(store, aggregate, this.descriptor);
  }

  /**
   * Starts a new live session.
   * @returns new session object.
   */
  live(): Session {
    const store = new Store();
    const storage = this.descriptor.storage ?? new InMemoryStorageFactory();
    const cache = new Cache(storage.create('cache'));

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter,
      DefaultTimeProvider,
      store,
      cache
    );

    return new Session(store, aggregate, this.descriptor);
  }
}
