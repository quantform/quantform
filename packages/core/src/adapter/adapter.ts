import { now, timestamp } from '../shared';
import { PaperExecutor } from './paper/executor/paper-executor';
import { PaperAdapter } from './paper';
import { Store } from '../store';
import { InstrumentSelector, Order, Candle } from '../domain';
import { Feed } from '../storage';

/**
 * Shared context for adapter execution. Provides access to the store.
 */
export class AdapterContext {
  /**
   * Returns the current unix timestamp (points to historical date in case of backtest).
   */
  get timestamp(): timestamp {
    return this.adapter.timestamp();
  }

  constructor(private readonly adapter: Adapter, readonly store: Store) {}
}

/**
 * Base adapter class, you should derive your own adapter from this class.
 * @abstract
 */
export abstract class Adapter {
  context: AdapterContext;

  abstract name: string;

  timestamp(): timestamp {
    return now();
  }

  /**
   * Setup an adapter.
   * @param context
   */
  async awake(context: AdapterContext): Promise<void> {
    this.context = context;
  }

  /**
   * Dispose an adapter.
   */
  async dispose(): Promise<void> {}

  /**
   * Subscribe to collection of instruments.
   * @param instruments
   */
  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    throw new Error('method not implemented');
  }

  /**
   *
   */
  account(): Promise<void> {
    throw new Error('method not implemented');
  }

  /**
   * Opens new order.
   * @param order an order to open.
   */
  open(order: Order): Promise<void> {
    throw new Error('method not implemented');
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    throw new Error('method not implemented');
  }

  history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    throw new Error('method not implemented');
  }

  feed(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    destination: Feed,
    callback: (timestamp: number) => void
  ): Promise<void> {
    throw new Error('method not implemented');
  }

  abstract createPaperExecutor(adapter: PaperAdapter): PaperExecutor;
}
