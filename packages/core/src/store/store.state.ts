import { timestamp } from '../common';
import {
  Instrument,
  Balance,
  Order,
  Orderbook,
  Asset,
  Trade,
  AssetSelector,
  InstrumentSelector
} from '../domain';

export class State {
  timestamp: timestamp;

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

  order: {
    pending: Record<string, Order>;
    filled: Record<string, Order>;
    canceled: Record<string, Order>;
    rejected: Record<string, Order>;
  } = {
    pending: {},
    filled: {},
    canceled: {},
    rejected: {}
  };
}
