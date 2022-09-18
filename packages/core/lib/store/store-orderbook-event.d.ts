import { InstrumentSelector, Liquidity } from '../domain';
import { timestamp } from '../shared';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
export declare class OrderbookPatchEvent implements StoreEvent {
    readonly instrument: InstrumentSelector;
    readonly ask: Liquidity;
    readonly bid: Liquidity;
    readonly timestamp: timestamp;
    constructor(instrument: InstrumentSelector, ask: Liquidity, bid: Liquidity, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-orderbook-event.d.ts.map