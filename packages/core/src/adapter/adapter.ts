import { Candle, InstrumentSelector, Order } from '../domain';
import { now, timestamp } from '../shared';
import { Cache, Feed } from '../storage';
import { Store } from '../store';
import { PaperAdapter } from './paper';
import { PaperEngine } from './paper/engine/paper-engine';

export type AdapterTimeProvider = {
  timestamp: () => number;
};

export const DefaultTimeProvider = {
  timestamp: () => now()
};

export type AdapterFactory = (
  timeProvider: AdapterTimeProvider,
  store: Store,
  cache: Cache
) => Adapter;

export type HistoryQuery = {
  instrument: InstrumentSelector;
  timeframe: number;
  length: number;
};

export type FeedQuery = {
  instrument: InstrumentSelector;
  from: timestamp;
  to: timestamp;
  destination: Feed;
  callback: (timestamp: number) => void;
};

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

  abstract history(query: HistoryQuery): Promise<Candle[]>;

  abstract feed(query: FeedQuery): Promise<void>;

  abstract createPaperEngine(adapter: PaperAdapter): PaperEngine;
}
