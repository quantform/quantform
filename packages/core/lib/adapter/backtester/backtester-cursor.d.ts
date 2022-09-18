import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed, StorageEvent } from '../../storage';
export declare class BacktesterCursor {
    readonly instrument: InstrumentSelector;
    private readonly feed;
    private page;
    private pageIndex;
    completed: boolean;
    get size(): number;
    constructor(instrument: InstrumentSelector, feed: Feed);
    peek(): StorageEvent | undefined;
    dequeue(): StorageEvent;
    fetchNextPage(from: timestamp, to: number): Promise<void>;
}
//# sourceMappingURL=backtester-cursor.d.ts.map