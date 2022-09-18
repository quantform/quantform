import { InstrumentSelector, Order } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
/**
 * Patches a store with an existing pending order.
 * No store changing events are propagated.
 */
export declare class OrderLoadEvent implements StoreEvent {
    readonly order: Order;
    readonly timestamp: timestamp;
    constructor(order: Order, timestamp: timestamp);
    handle(state: State): void;
}
export declare class OrderNewEvent implements StoreEvent {
    readonly order: Order;
    readonly timestamp: timestamp;
    constructor(order: Order, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderPendingEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderFilledEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly averageExecutionRate: decimal;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, averageExecutionRate: decimal, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderCancelingEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderCanceledEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderCancelFailedEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
export declare class OrderRejectedEvent implements StoreEvent {
    readonly id: string;
    readonly instrument: InstrumentSelector;
    readonly timestamp: timestamp;
    constructor(id: string, instrument: InstrumentSelector, timestamp: timestamp);
    handle(state: State, changes: StateChangeTracker): void;
}
//# sourceMappingURL=store-order-event.d.ts.map