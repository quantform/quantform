import { InstrumentSelector } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
/**
 * Patches a store with specific event @see TradePatchEvent
 * If there is no specific @see Trade in store, it will create a new one.
 */
export declare class TradePatchEvent implements StoreEvent {
    readonly instrument: InstrumentSelector;
    readonly rate: decimal;
    readonly quantity: decimal;
    readonly timestamp: timestamp;
    constructor(instrument: InstrumentSelector, rate: decimal, quantity: decimal, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-trade-event.d.ts.map