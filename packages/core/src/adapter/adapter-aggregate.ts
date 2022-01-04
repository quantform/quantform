import { Store } from '../store';
import { Adapter, AdapterContext } from '.';
import { Logger } from '../shared';
import {
  AdapterAccountCommand,
  AdapterAwakeCommand,
  AdapterDisposeCommand,
  AdapterFeedCommand,
  AdapterHistoryQuery,
  AdapterOrderCancelCommand,
  AdapterOrderOpenCommand,
  AdapterSubscribeCommand
} from './adapter.event';
import { InstrumentSelector, Order, Candle } from '../domain';
import { Feed } from './../storage';

/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(adapters: Adapter[], private readonly store: Store) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  /**
   * Returns adapter by name.
   * @param adapterName adapter name.
   * @returns
   */
  get(adapterName: string): Adapter {
    return this.adapter[adapterName];
  }

  /**
   * Sets up all adapters.
   */
  async awake(): Promise<void> {
    for (const adapter in this.adapter) {
      await this.dispatch(adapter, new AdapterAwakeCommand());
      await this.dispatch(adapter, new AdapterAccountCommand());
    }
  }

  /**
   * Disposes all adapters.
   */
  async dispose(): Promise<any> {
    for (const adapter in this.adapter) {
      await this.dispatch(adapter, new AdapterDisposeCommand());
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
      await this.dispatch(adapterName, new AdapterSubscribeCommand(grouped[adapterName]));
    }
  }

  /**
   * Opens new order.
   * @param order an order to open.
   */
  open(order: Order): Promise<void> {
    return this.dispatch<AdapterOrderOpenCommand, void>(
      order.instrument.base.adapter,
      new AdapterOrderOpenCommand(order)
    );
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    return this.dispatch(
      order.instrument.base.adapter,
      new AdapterOrderCancelCommand(order)
    );
  }

  /**
   *
   * @param selector Returns collection of candles for specific history.
   * @param timeframe
   * @param length
   * @returns
   */
  history(
    selector: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    return this.dispatch<AdapterHistoryQuery, Candle[]>(
      selector.base.adapter,
      new AdapterHistoryQuery(selector, timeframe, length)
    );
  }

  /**
   * Feeds a storage with historical instrument data.
   * @param selector
   * @param from
   * @param to
   * @param destination
   * @param callback
   * @returns
   */
  feed(
    selector: InstrumentSelector,
    from: number,
    to: number,
    destination: Feed,
    callback: (timestamp: number) => void
  ): Promise<void> {
    return this.dispatch(
      selector.base.adapter,
      new AdapterFeedCommand(selector, from, to, destination, callback)
    );
  }

  /**
   * Routes and executes command to a specific adapter.
   * @param adapterName name of adapter
   * @param command
   * @returns
   */
  private dispatch<TCommand extends { type: string }, TResponse>(
    adapterName: string,
    command: TCommand
  ): Promise<TResponse> {
    const adapter = this.get(adapterName);

    if (!adapter) {
      throw new Error(
        `Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`
      );
    }

    try {
      return adapter.dispatch(command, new AdapterContext(adapter, this.store));
    } catch (e) {
      Logger.error(e);
    }
  }
}
