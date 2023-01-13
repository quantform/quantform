import { PaperAdapter, PaperEngine } from '@lib/adapter';
import { InstrumentSelector, Ohlc, Order } from '@lib/component';
import { now, timestamp } from '@lib/shared';
import { StorageEvent } from '@lib/storage';
import { Store } from '@lib/store';

export type AdapterTimeProvider = {
  timestamp: () => number;
};

export const DefaultTimeProvider = {
  timestamp: () => now()
};

export type FeedAsyncCallback = (timestamp: number, chunk: StorageEvent[]) => void;

export type AdapterFactory = (
  timeProvider: AdapterTimeProvider,
  store: Store,
  cache: Cache
) => Adapter;

/**
 * Base adapter class, you should derive your own adapter from this class.
 * @abstract
 */
export abstract class Adapter {
  abstract name: string;

  timestamp(): timestamp {
    return this.timeProvider.timestamp();
  }

  constructor(private readonly timeProvider: AdapterTimeProvider) {}

  /**
   * Setup an adapter.
   */
  abstract awake(): Promise<void>;

  /**
   * Dispose an adapter.
   */
  abstract dispose(): Promise<void>;

  /**
   * Subscribe to collection of instruments.
   * @param instruments
   */
  abstract subscribe(instruments: InstrumentSelector[]): Promise<void>;

  /**
   *
   */
  abstract account(): Promise<void>;

  /**
   * Opens new order.
   * @param order an order to open.
   */
  abstract open(order: Order): Promise<void>;

  /**
   * Cancels specific order.
   */
  abstract cancel(order: Order): Promise<void>;

  abstract history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Ohlc[]>;

  abstract feed(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void>;

  abstract createPaperEngine(adapter: PaperAdapter): PaperEngine;
}
