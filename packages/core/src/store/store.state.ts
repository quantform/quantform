import { timestamp } from '../shared';
import {
  Instrument,
  Balance,
  Order,
  Orderbook,
  Asset,
  Trade,
  AssetSelector,
  InstrumentSelector,
  Component
} from '../domain';

export interface StateChangeTracker {
  commit(component: Component);
  commitPendingChanges();
}

export class State {
  timestamp: timestamp;

  // available trading assets and instruments
  universe: {
    asset: Record<string, Asset>;
    instrument: Record<string, Instrument>;
  } = {
    asset: {},
    instrument: {}
  };

  subscription: {
    asset: Record<string, AssetSelector>;
    instrument: Record<string, InstrumentSelector>;
  } = {
    asset: {},
    instrument: {}
  };

  trade: Record<string, Trade> = {};
  orderbook: Record<string, Orderbook> = {};
  balance: Record<string, Balance> = {};
  order: Record<string, Order> = {};
}
