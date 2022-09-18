import { Instrument, Position, PositionMode } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
export declare class PositionLoadEvent implements StoreEvent {
    readonly position: Position;
    readonly timestamp: timestamp;
    constructor(position: Position, timestamp: timestamp);
    handle(state: State): void;
}
export declare class PositionPatchEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: Instrument;
    readonly rate: decimal;
    readonly size: decimal;
    readonly leverage: number;
    readonly mode: PositionMode;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: Instrument, rate: decimal, size: decimal, leverage: number, mode: PositionMode, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-position-event.d.ts.map