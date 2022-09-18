import { AssetSelector, InstrumentSelector } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
/**
 * Updates the free and freezed balance of the given asset.
 */
export declare class BalancePatchEvent implements StoreEvent {
    readonly asset: AssetSelector;
    readonly free: decimal;
    readonly freezed: decimal;
    readonly timestamp: timestamp;
    constructor(asset: AssetSelector, free: decimal, freezed: decimal, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
/**
 *
 */
export declare class BalanceTransactEvent implements StoreEvent {
    readonly asset: AssetSelector;
    readonly amount: decimal;
    readonly timestamp: timestamp;
    constructor(asset: AssetSelector, amount: decimal, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
/**
 *
 */
export declare class BalanceLockOrderEvent implements StoreEvent {
    readonly orderId: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(orderId: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
/**
 *
 */
export declare class BalanceUnlockOrderEvent implements StoreEvent {
    readonly orderId: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(orderId: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-balance-event.d.ts.map