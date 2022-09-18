import { Adapter, AdapterFactory, AdapterTimeProvider, AssetSelector, Cache, Candle, FeedAsyncCallback, InstrumentSelector, Order, PaperAdapter, PaperEngine, Store, timestamp } from '@quantform/core';
import { DyDxConnector } from './dydx-connector';
export declare const DYDX_ADAPTER_NAME = "dydx";
export declare function dydxCacheKey(key: string): {
    key: string;
};
export declare const DyDxOptions: {
    Mainnet: {
        http: string;
        ws: string;
        networkId: number;
    };
    Ropsten: {
        http: string;
        ws: string;
        networkId: number;
    };
};
export declare function dydx(options?: {
    http: string;
    ws: string;
    networkId: number;
}): AdapterFactory;
export declare class DyDxAdapter extends Adapter {
    private readonly connector;
    private readonly store;
    private readonly cache;
    readonly name = "dydx";
    readonly quote: AssetSelector;
    constructor(connector: DyDxConnector, store: Store, cache: Cache, timeProvider: AdapterTimeProvider);
    createPaperEngine(adapter: PaperAdapter): PaperEngine;
    awake(): Promise<void>;
    dispose(): Promise<void>;
    account(): Promise<void>;
    subscribe(selectors: InstrumentSelector[]): Promise<void>;
    open(order: Order): Promise<void>;
    cancel(order: Order): Promise<void>;
    history(instrument: InstrumentSelector, timeframe: number, length: number): Promise<Candle[]>;
    feed(selector: InstrumentSelector, from: timestamp, to: timestamp, callback: FeedAsyncCallback): Promise<void>;
}
//# sourceMappingURL=dydx-adapter.d.ts.map