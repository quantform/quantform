import {
  AdapterAggregate,
  AdapterFactory,
  BacktesterListener,
  BacktesterStreamer,
  createBacktesterAdapterFactory,
  createPaperAdapterFactory,
  DefaultTimeProvider
} from '../adapter';
import { decimal, now } from '../shared';
import {
  Cache,
  Feed,
  inMemoryStorageFactory,
  Measurement,
  StorageFactory
} from '../storage';
import { Store } from '../store';
import { AssetSelector } from './asset';
import { Session } from './session';

export type SessionFeature = (builder: SessionBuilder) => void;

export function deposit(selector: AssetSelector, amount: decimal): SessionFeature {
  return (builder: SessionBuilder) => {
    builder.useBalance(selector, amount);
  };
}

export function period(from: Date, to?: Date): SessionFeature {
  return (builder: SessionBuilder) => {
    builder.usePeriod(from.getTime(), to?.getTime() ?? now());
  };
}

export class SessionBuilder {
  public id: number = now();
  public adapter = new Array<AdapterFactory>();
  public storage: StorageFactory = inMemoryStorageFactory();
  public balance: Record<string, decimal> = {};
  public period = {
    from: 0,
    to: Number.MAX_VALUE
  };

  /**
   * Unique session identifier, used to identify session in the storage.
   * You can generate new id every time you start the new session or provide
   * session id explicitly to resume previous session (in code or via CLI).
   * If you don't provide session id, it will generate new one based on time.
   */
  useSessionId(id: number): SessionBuilder {
    this.id = id;

    return this;
  }

  /**
   * Collection of adapters used to connect to the exchanges.
   */
  useAdapter(adapter: AdapterFactory): SessionBuilder {
    this.adapter.push(adapter);

    return this;
  }

  /**
   * Provides historical data for backtest, it's not required for live and paper
   * sessions. Stores session variables i.e. indicators, orders, or any other type of time
   * series data. You can install @quantform/editor to render this data in your browser.
   */
  useStorage(storage: StorageFactory): SessionBuilder {
    this.storage = storage;

    return this;
  }

  useBalance(selector: AssetSelector, amount: decimal): SessionBuilder {
    this.balance[selector.id] = amount;

    return this;
  }

  usePeriod(from: number, to: number): SessionBuilder {
    this.period.from = from;
    this.period.to = to;

    return this;
  }

  /**
   * Starts a new backtest session.
   * @param listener backtest event listener.
   * @returns new session object.
   */
  backtest(listener?: BacktesterListener): [Session, BacktesterStreamer] {
    const store = new Store();
    const feed = new Feed(this.storage('feed'));
    const cache = new Cache(this.storage('cache'));
    const measurement = new Measurement(this.storage('measurement'));

    const streamer = new BacktesterStreamer(store, feed, this.period, listener);

    const aggregate = new AdapterAggregate(
      this.adapter.map(it =>
        createBacktesterAdapterFactory(
          createPaperAdapterFactory(it, { balance: this.balance }),
          streamer
        )
      ),
      streamer.getTimeProvider(),
      store,
      cache
    );

    const session = new Session(this.id, store, aggregate, measurement);

    return [session, streamer];
  }

  /**
   * Starts a new paper session.
   * @returns new session object.
   */
  paper(): Session {
    const store = new Store();
    const cache = new Cache(this.storage('cache'));
    const measurement = new Measurement(this.storage('measurement'));

    const aggregate = new AdapterAggregate(
      this.adapter.map(it => createPaperAdapterFactory(it, { balance: this.balance })),
      DefaultTimeProvider,
      store,
      cache
    );

    return new Session(this.id, store, aggregate, measurement);
  }

  /**
   * Starts a new live session.
   * @returns new session object.
   */
  live(): Session {
    const store = new Store();
    const cache = new Cache(this.storage('cache'));
    const measurement = new Measurement(this.storage('measurement'));

    const aggregate = new AdapterAggregate(
      this.adapter,
      DefaultTimeProvider,
      store,
      cache
    );

    return new Session(this.id, store, aggregate, measurement);
  }
}
