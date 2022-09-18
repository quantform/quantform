import { Candle, InstrumentSelector, Order } from '../../domain';
import { timestamp } from '../../shared';
import { Store } from '../../store';
import { Adapter } from '..';
import { AdapterFactory, FeedAsyncCallback } from '../adapter';
import { PaperAdapter, PaperOptions } from '../paper';
import { PaperEngine } from '../paper/engine/paper-engine';
import { BacktesterStreamer } from './backtester-streamer';
export interface BacktesterOptions extends PaperOptions {
    from: timestamp;
    to: timestamp;
}
export declare function createBacktesterAdapterFactory(decoratedAdapterFactory: AdapterFactory, streamer: BacktesterStreamer): AdapterFactory;
export declare class BacktesterAdapter extends Adapter {
    readonly decoratedAdapter: Adapter;
    readonly streamer: BacktesterStreamer;
    readonly store: Store;
    readonly name: string;
    constructor(decoratedAdapter: Adapter, streamer: BacktesterStreamer, store: Store);
    awake(): Promise<void>;
    dispose(): Promise<void>;
    subscribe(instruments: InstrumentSelector[]): Promise<void>;
    account(): Promise<void>;
    open(order: Order): Promise<void>;
    cancel(order: Order): Promise<void>;
    history(instrument: InstrumentSelector, timeframe: number, length: number): Promise<Candle[]>;
    feed(instrument: InstrumentSelector, from: timestamp, to: timestamp, callback: FeedAsyncCallback): Promise<void>;
    createPaperEngine(adapter: PaperAdapter): PaperEngine;
}
//# sourceMappingURL=backtester-adapter.d.ts.map