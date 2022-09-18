import { Candle, InstrumentSelector, Order } from '../../domain';
import { timestamp } from '../../shared';
import { Store } from '../../store';
import { Adapter } from '..';
import { AdapterFactory, FeedAsyncCallback } from '../adapter';
import { PaperEngine } from './engine/paper-engine';
export interface PaperOptions {
    balance: {
        [key: string]: number;
    };
}
export declare function createPaperAdapterFactory(decoratedAdapterFactory: AdapterFactory, options: PaperOptions): AdapterFactory;
export declare class PaperAdapter extends Adapter {
    readonly decoratedAdapter: Adapter;
    readonly store: Store;
    readonly options: PaperOptions;
    readonly name: string;
    private engine?;
    constructor(decoratedAdapter: Adapter, store: Store, options: PaperOptions);
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
//# sourceMappingURL=paper-adapter.d.ts.map