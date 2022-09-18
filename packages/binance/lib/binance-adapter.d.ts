import { Adapter, AdapterFactory, AdapterTimeProvider, Cache, Candle, FeedAsyncCallback, InstrumentSelector, Order, PaperAdapter, PaperEngine, Store, StoreEvent, timestamp } from '@quantform/core';
import { BinanceConnector } from './binance-connector';
export declare const BINANCE_ADAPTER_NAME = "binance";
export declare function binanceCacheKey(key: string): {
    key: string;
};
export declare function binance(options?: {
    key: string;
    secret: string;
}): AdapterFactory;
export declare class BinanceAdapter extends Adapter {
    private readonly connector;
    private readonly store;
    private readonly cache;
    readonly name = "binance";
    queuedOrderCompletionEvents: StoreEvent[];
    constructor(connector: BinanceConnector, store: Store, cache: Cache, timeProvider: AdapterTimeProvider);
    createPaperEngine(adapter: PaperAdapter): PaperEngine;
    awake(): Promise<void>;
    dispose(): Promise<void>;
    account(): Promise<void>;
    subscribe(selectors: InstrumentSelector[]): Promise<void>;
    open(order: Order): Promise<void>;
    cancel(order: Order): Promise<void>;
    history(selector: InstrumentSelector, timeframe: number, length: number): Promise<Candle[]>;
    feed(selector: InstrumentSelector, from: timestamp, to: timestamp, callback: FeedAsyncCallback): Promise<void>;
}
//# sourceMappingURL=binance-adapter.d.ts.map