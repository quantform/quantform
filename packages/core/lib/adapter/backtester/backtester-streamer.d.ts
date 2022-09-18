import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed } from '../../storage';
import { Store } from '../../store';
import { AdapterTimeProvider } from '../adapter';
/**
 * Listen to backtest session events.
 */
export interface BacktesterListener {
    /**
     * Called once when backtest started.
     */
    onBacktestStarted?(streamer: BacktesterStreamer): void;
    /**
     * Called every time when backtest progress updated.
     */
    onBacktestUpdated?(streamer: BacktesterStreamer): void;
    /**
     * Called once when backtest completed.
     */
    onBacktestCompleted?(streamer: BacktesterStreamer): void;
}
export declare class BacktesterStreamer {
    private readonly store;
    private readonly feed;
    private readonly period;
    private readonly listener?;
    private sequenceUpdateBatch;
    private cursor;
    private stopAcquire;
    timestamp: timestamp;
    sequence: number;
    constructor(store: Store, feed: Feed, period: {
        from: number;
        to: number;
    }, listener?: BacktesterListener | undefined);
    getTimeProvider(): AdapterTimeProvider;
    subscribe(instrument: InstrumentSelector): void;
    /**
     * Increments stop counter.
     */
    stop(): void;
    /**
     * Decreases stop counter and continues execution if no more stops requested.
     */
    tryContinue(): void;
    private processNext;
    private current;
}
//# sourceMappingURL=backtester-streamer.d.ts.map