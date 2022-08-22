import { Candle, InstrumentSelector, Order } from '../domain';
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
  ) {}

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
      } catch (e) {
        Logger.error(adapter.name, e);
      }

      this.adapter[adapter.name] = adapter;
    }
  }

  /**
   * Disposes all adapters.
   */
  async dispose(): Promise<any> {
    for (const adapter of Object.values(this.adapter)) {
      try {
        await adapter.dispose();
      } catch (e) {
        Logger.error(adapter.name, e);
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
      Logger.debug(adapterName, `subscribing for ${grouped[adapterName].join(', ')}`);

      try {
        await this.get(adapterName).subscribe(grouped[adapterName]);
      } catch (e) {
        Logger.error(adapterName, e);
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
      `opening a new ${order.type} on ${order.instrument.toString()} as ${order.id}`
    );

    try {
      await this.get(adapterName).open(order);
    } catch (e) {
      Logger.error(adapterName, e);
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
    } catch (e) {
      Logger.error(adapterName, e);
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
  ): Promise<Candle[]> {
    try {
      return this.get(instrument.base.adapterName).history(instrument, timeframe, length);
    } catch (e) {
      Logger.error(instrument.base.adapterName, e);
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
    } catch (e) {
      Logger.error(instrument.base.adapterName, e);
    }
  }
}
