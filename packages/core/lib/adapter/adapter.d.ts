import { Candle, InstrumentSelector, Order } from '../domain';
import { timestamp } from '../shared';
import { Cache, StorageEvent } from '../storage';
import { Store } from '../store';
import { PaperAdapter } from './paper';
import { PaperEngine } from './paper/engine/paper-engine';
export declare type AdapterTimeProvider = {
    timestamp: () => number;
};
export declare const DefaultTimeProvider: {
    timestamp: () => number;
};
export declare type FeedAsyncCallback = (timestamp: number, chunk: StorageEvent[]) => void;
export declare type AdapterFactory = (timeProvider: AdapterTimeProvider, store: Store, cache: Cache) => Adapter;
/**
 * Base adapter class, you should derive your own adapter from this class.
 * @abstract
 */
export declare abstract class Adapter {
    private readonly timeProvider;
    abstract name: string;
    timestamp(): timestamp;
    constructor(timeProvider: AdapterTimeProvider);
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
    abstract history(instrument: InstrumentSelector, timeframe: number, length: number): Promise<Candle[]>;
    abstract feed(instrument: InstrumentSelector, from: timestamp, to: timestamp, callback: FeedAsyncCallback): Promise<void>;
    abstract createPaperEngine(adapter: PaperAdapter): PaperEngine;
}
//# sourceMappingURL=adapter.d.ts.map