import { InstrumentSelector, Ohlc, Order } from '../domain';
import { Logger, timestamp } from '../shared';
import { Cache } from '../storage';
import { Store } from '../store';
import { Adapter } from '.';
import { AdapterFactory, AdapterTimeProvider, FeedAsyncCallback } from './adapter';
import { adapterNotFoundError } from './error';

/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(
    private readonly factories: AdapterFactory[],
    private readonly timeProvider: AdapterTimeProvider,
    private readonly store: Store,
    private readonly cache: Cache
  ) { }

  /**
   * Returns adapter by name.
   * @param adapterName adapter name.
   * @returns
   */
  get(adapterName: string): Adapter {
    const adapter = this.adapter[adapterName];

    if (!adapter) {
      throw adapterNotFoundError(adapterName);
    }

    return adapter;
  }

  /**
   * Sets up all adapters.
   */
  async awake(): Promise<void> {
    for (const factory of this.factories) {
      const adapter = factory(this.timeProvider, this.store, this.cache);

      try {
        await adapter.awake();
        await adapter.account();
      } catch (error) {
        Logger.error(adapter.name, error);
      }

      this.adapter[adapter.name] = adapter;
    }
  }

  /**
   * Disposes all adapters.
   */
  async dispose(): Promise<void> {
    for (const adapter of Object.values(this.adapter)) {
      try {
        await adapter.dispose();
      } catch (error) {
        Logger.error(adapter.name, error);
      }
    }
  }

  /**
   * Subscribe to collection of instruments.
   * @param selectors
   */
  async subscribe(selectors: InstrumentSelector[]): Promise<void> {
    const grouped = selectors.reduce((aggregate, it) => {
      const adapter = it.base.adapterName;

      if (aggregate[adapter]) {
        aggregate[adapter].push(it);
      } else {
        aggregate[adapter] = [it];
      }

      return aggregate;
    }, {} as Record<string, InstrumentSelector[]>);

    for (const adapterName in grouped) {
      try {
        await this.get(adapterName).subscribe(grouped[adapterName]);
      } catch (error) {
        Logger.error(adapterName, error);

        throw error;
      }
    }
  }

  /**
   * Opens new order.
   * @param order an order to open.
   */
  async open(order: Order): Promise<void> {
    const { adapterName } = order.instrument.base;

    Logger.debug(
      adapterName,
      `opening a new order on ${order.instrument.id} as ${order.id}`
    );

    try {
      await this.get(adapterName).open(order);
    } catch (error) {
      Logger.error(adapterName, error);

      throw error;
    }
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    const { adapterName } = order.instrument.base;

    Logger.debug(adapterName, `canceling a ${order.id} order`);

    try {
      return this.get(adapterName).cancel(order);
    } catch (error) {
      Logger.error(adapterName, error);

      throw error;
    }
  }

  /**
   *
   * @returns
   */
  history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Ohlc[]> {
    try {
      return this.get(instrument.base.adapterName).history(instrument, timeframe, length);
    } catch (error) {
      Logger.error(instrument.base.adapterName, error);

      throw error;
    }
  }

  /**
   * Feeds a storage with historical instrument data.
   * @returns
   */
  feed(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    try {
      return this.get(instrument.base.adapterName).feed(instrument, from, to, callback);
    } catch (error) {
      Logger.error(instrument.base.adapterName, error);

      throw error;
    }
  }
}
