import {
  AdapterAggregate,
  AdapterFactory,
  BacktesterListener,
  BacktesterStreamer,
  createBacktesterAdapterFactory,
  createPaperAdapterFactory,
  DefaultTimeProvider
} from '@lib/adapter';
import { AssetSelector, Session } from '@lib/component';
import { decimal, now } from '@lib/shared';
import {
  Cache,
  Feed,
  inMemoryStorageFactory,
  Measurement,
  StorageFactory
} from '@lib/storage';
import { Store } from '@lib/store';

export type SessionFeature = (builder: SessionBuilder) => void;

export function simulate({
  period,
  balance
}: {
  period: { from: Date; to?: Date };
  balance: [AssetSelector, decimal][];
}): SessionFeature {
  return (builder: SessionBuilder) => {
    builder.usePeriod(period.from.getTime(), period.to?.getTime() ?? now());
    balance.forEach(([selector, amount]) => builder.useBalance(selector, amount));
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
