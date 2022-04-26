import { Candle, InstrumentSelector, Order } from '../domain';
import { Logger } from '../shared';
import { Cache } from '../storage';
import { Store } from '../store';
import { Adapter, AdapterContext, FeedQuery, HistoryQuery } from '.';

/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(
    adapters: Adapter[],
    private readonly store: Store,
    private readonly cache: Cache
  ) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  /**
   * Returns adapter by name.
   * @param adapterName adapter name.
   * @returns
   */
  get(adapterName: string): Adapter {
    const adapter = this.adapter[adapterName];

    if (!adapter) {
      throw new Error(
        `Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`
      );
    }

    return adapter;
  }

  /**
   * Sets up all adapters.
   */
  async awake(): Promise<void> {
    for (const adapter of Object.values(this.adapter)) {
      try {
        await adapter.awake(this.createContext(adapter));
        await adapter.account();
      } catch (e) {
        Logger.error(e);
      }
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
        Logger.error(e);
      }
    }
  }

  /**
   * Subscribe to collection of instruments.
   * @param selectors
   */
  async subscribe(selectors: InstrumentSelector[]): Promise<void> {
    const grouped = selectors
      .filter(it => it != null)
      .reduce((aggregate, it) => {
        const adapter = it.base.adapter;

        if (aggregate[adapter]) {
          aggregate[adapter].push(it);
        } else {
          aggregate[adapter] = [it];
        }

        return aggregate;
      }, {});

    for (const adapterName in grouped) {
      try {
        await this.get(adapterName).subscribe(grouped[adapterName]);
      } catch (e) {
        Logger.error(e);
      }
    }
  }

  /**
   * Opens new order.
   * @param order an order to open.
   */
  async open(order: Order): Promise<void> {
    try {
      await this.get(order.instrument.base.adapter).open(order);
    } catch (e) {
      Logger.error(e);
    }
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    try {
      return this.get(order.instrument.base.adapter).cancel(order);
    } catch (e) {
      Logger.error(e);
    }
  }

  /**
   *
   * @returns
   */
  history(query: HistoryQuery): Promise<Candle[]> {
    try {
      return this.get(query.instrument.base.adapter).history(query);
    } catch (e) {
      Logger.error(e);
    }
  }

  /**
   * Feeds a storage with historical instrument data.
   * @returns
   */
  feed(query: FeedQuery): Promise<void> {
    try {
      return this.get(query.instrument.base.adapter).feed(query);
    } catch (e) {
      Logger.error(e);
    }
  }

  /**
   *
   * @param adapter
   * @returns
   */
  private createContext(adapter: Adapter) {
    return new AdapterContext(adapter, this.store, this.cache);
  }
}
