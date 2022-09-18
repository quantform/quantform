import { Candle, InstrumentSelector, Order } from '../domain';
import { timestamp } from '../shared';
import { Cache } from '../storage';
import { Store } from '../store';
import { Adapter } from '.';
import { AdapterFactory, AdapterTimeProvider, FeedAsyncCallback } from './adapter';
/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export declare class AdapterAggregate {
    private readonly factories;
    private readonly timeProvider;
    private readonly store;
    private readonly cache;
    private readonly adapter;
    constructor(factories: AdapterFactory[], timeProvider: AdapterTimeProvider, store: Store, cache: Cache);
    /**
     * Returns adapter by name.
     * @param adapterName adapter name.
     * @returns
     */
    get(adapterName: string): Adapter;
    /**
     * Sets up all adapters.
     */
    awake(): Promise<void>;
    /**
     * Disposes all adapters.
     */
    dispose(): Promise<void>;
    /**
     * Subscribe to collection of instruments.
     * @param selectors
     */
    subscribe(selectors: InstrumentSelector[]): Promise<void>;
    /**
     * Opens new order.
     * @param order an order to open.
     */
    open(order: Order): Promise<void>;
    /**
     * Cancels specific order.
     */
    cancel(order: Order): Promise<void>;
    /**
     *
     * @returns
     */
    history(instrument: InstrumentSelector, timeframe: number, length: number): Promise<Candle[]>;
    /**
     * Feeds a storage with historical instrument data.
     * @returns
     */
    feed(instrument: InstrumentSelector, from: timestamp, to: timestamp, callback: FeedAsyncCallback): Promise<void>;
}
//# sourceMappingURL=adapter-aggregate.d.ts.map