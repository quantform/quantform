import {
  Asset,
  AssetSelector,
  Balance,
  Component,
  Instrument,
  InstrumentSelector,
  Order,
  Orderbook,
  Trade
} from '../domain';
import { Set, timestamp } from '../shared';

export interface StateChangeTracker {
  commit(component: Component): void;
  commitPendingChanges(): void;
}

export class InnerSet<T extends { id: string }> extends Set<T> {
  constructor(public readonly id: string, values?: ReadonlyArray<T>) {
    super(values);
  }
}

export class State {
  timestamp: timestamp = 0;

  universe: {
    asset: Set<Asset>;
    instrument: Set<Instrument>;
  } = {
    asset: new Set<Asset>(),
    instrument: new Set<Instrument>()
  };

  subscription: {
    asset: Set<AssetSelector>;
    instrument: Set<InstrumentSelector>;
  } = {
    asset: new Set<AssetSelector>(),
    instrument: new Set<InstrumentSelector>()
  };

  trade: Set<Trade> = new Set<Trade>();
  orderbook: Set<Orderbook> = new Set<Orderbook>();
  balance: Set<Balance> = new Set<Balance>();
  order: Set<InnerSet<Order>> = new Set<InnerSet<Order>>();
}
