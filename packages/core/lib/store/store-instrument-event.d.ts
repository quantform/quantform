import { Asset, Commission, InstrumentSelector } from '../domain';
import { timestamp } from '../shared';
import { State, StateChangeTracker } from '.';
import { StoreEvent } from './store-event';
export declare class InstrumentPatchEvent implements StoreEvent {
    readonly timestamp: timestamp;
    readonly base: Asset;
    readonly quote: Asset;
    readonly commission: Commission;
    readonly raw: string;
    readonly leverage?: number | undefined;
    constructor(timestamp: timestamp, base: Asset, quote: Asset, commission: Commission, raw: string, leverage?: number | undefined);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class InstrumentSubscriptionEvent implements StoreEvent {
    readonly timestamp: timestamp;
    readonly instrument: InstrumentSelector;
    readonly subscribed: boolean;
    constructor(timestamp: timestamp, instrument: InstrumentSelector, subscribed: boolean);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-instrument-event.d.ts.map