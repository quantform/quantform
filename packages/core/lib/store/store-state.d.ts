import { Asset, AssetSelector, Balance, Component, Instrument, InstrumentSelector, Order, Orderbook, Trade } from '../domain';
import { Set, timestamp } from '../shared';
export interface StateChangeTracker {
    commit(component: Component): void;
    commitPendingChanges(): void;
}
export declare class InnerSet<T extends {
    id: string;
}> extends Set<T> {
    readonly id: string;
    constructor(id: string, values?: ReadonlyArray<T>);
}
export declare class State {
    timestamp: timestamp;
    universe: {
        asset: Set<Asset>;
        instrument: Set<Instrument>;
    };
    subscription: {
        asset: Set<AssetSelector>;
        instrument: Set<InstrumentSelector>;
    };
    trade: Set<Trade>;
    orderbook: Set<Orderbook>;
    balance: Set<Balance>;
    order: Set<InnerSet<Order>>;
}
//# sourceMappingURL=store-state.d.ts.map