import {
  Adapter,
  AdapterFactory,
  AdapterNotFoundError,
  AdapterTimeProvider,
  FeedAsyncCallback
} from '@lib/adapter';
import { InstrumentSelector, Ohlc, Order } from '@lib/domain';
import { log, timestamp } from '@lib/shared';
import { Cache } from '@lib/storage';
import { Store } from '@lib/store';

/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export class AdapterAggregate {
  private readonly logger = log(AdapterAggregate.name);
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
      throw new AdapterNotFoundError(adapterName);
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
        this.logger.error(`unable to awake for ${adapter.name}`, error);
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
        this.logger.error(`unable to dispose for ${adapter.name}`, error);
      }
    }
  }

  /**
   * Subscribe to collection of instruments. Usually forces adapter to subscribe
   * for orderbook and ticker streams.
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
        this.logger.error(
          `unable to subscribe for ${adapterName}`,
          grouped[adapterName],
          error
        );

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

    this.logger.debug(`opening a new order on ${order.instrument.id} as ${order.id}`);

    try {
      await this.get(adapterName).open(order);
    } catch (error) {
      this.logger.error(`unable to open a new order for ${adapterName}`, order, error);

      throw error;
    }
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    const { adapterName } = order.instrument.base;

    this.logger.debug(`canceling a ${order.id} order`);

    try {
      return this.get(adapterName).cancel(order);
    } catch (error) {
      this.logger.error(`unable to cancel a order for ${adapterName}`, order, error);

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
      this.logger.error(
        `unable to get history ${instrument.base.adapterName}`,
        { instrument, timeframe, length },
        error
      );

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
      this.logger.error(
        `unable to get feed ${instrument.base.adapterName}`,
        { instrument, from, to },
        error
      );

      throw error;
    }
  }
}
