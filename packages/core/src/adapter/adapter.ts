import { Candle, InstrumentSelector, Order } from '../domain';
import { now, timestamp } from '../shared';
import { Cache, Feed } from '../storage';
import { State, Store, StoreEvent } from '../store';
import { PaperAdapter } from './paper';
import { PaperSimulator } from './paper/simulator/paper-simulator';

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

  get snapshot(): State {
    return this.store.snapshot;
  }

  constructor(
    private readonly adapter: Adapter,
    private readonly store: Store,
    readonly cache: Cache
  ) {}

  dispatch(...events: StoreEvent[]) {
    return this.store.dispatch(...events);
  }
}

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

  abstract createPaperSimulator(adapter: PaperAdapter): PaperSimulator;
}
