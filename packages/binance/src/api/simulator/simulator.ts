import {
  whenOrderbookDepthSocket,
  whenOrderbookTickerSocket,
  whenTradeSocket,
  withExchangeInfoRequest,
  withOrderCancelRequest,
  withOrderNewRequest,
  withOrdersRequest,
  withUserAccountRequest
} from '@lib/api';
import { d, InferObservableType } from '@quantform/core';

import { SimulatorBalance, SimulatorBalanceEvent } from './simulator-balance';
import { SimulatorSymbol, SimulatorSymbolEvent } from './simulator-symbol';
import { useSimulatorOptions } from './use-simulator-options';

export type WithExchangeInfoType = InferObservableType<
  ReturnType<typeof withExchangeInfoRequest>
>;
export type WithUserAccountType = InferObservableType<
  ReturnType<typeof withUserAccountRequest>
>;
export type WithOrderNewType = InferObservableType<
  ReturnType<typeof withOrderNewRequest>
>;
export type WithOrderCancelType = InferObservableType<
  ReturnType<typeof withOrderCancelRequest>
>;
export type WithOrdersType = InferObservableType<ReturnType<typeof withOrdersRequest>>;
export type WhenOrderbookTickerSocketType = InferObservableType<
  ReturnType<typeof whenOrderbookTickerSocket>
>;
export type WhenOrderbookDepthSocketType = InferObservableType<
  ReturnType<typeof whenOrderbookDepthSocket>
>;
export type WhenTradeSocketType = InferObservableType<ReturnType<typeof whenTradeSocket>>;

export type Event<K extends string, T> = {
  type: K;
  what: T;
};

export type CreationEvent = Event<
  'created',
  WithExchangeInfoType & { options: ReturnType<typeof useSimulatorOptions> }
>;

export type SimulatorEvent =
  | CreationEvent
  | Event<'orderbook-ticker-changed', WhenOrderbookTickerSocketType & { symbol: string }>
  | Event<'orderbook-depth-changed', WhenOrderbookDepthSocketType & { symbol: string }>
  | Event<'trade-executed', WhenTradeSocketType & { symbol: string }>
  | SimulatorBalanceEvent
  | SimulatorSymbolEvent;

export class Simulator {
  private timestamp = 0;
  private ticks = 0;
  private events: SimulatorEvent[] = [];
  private readonly balance: Record<string, SimulatorBalance> = {};
  private readonly symbol: Record<string, SimulatorSymbol> = {};
  private readonly duration: { from?: number; to?: number } = {};

  private constructor(private readonly creation: CreationEvent) {}

  static from(event: CreationEvent) {
    const simulator = new Simulator(event);

    simulator.apply(event);

    return simulator;
  }

  withExchangeInfo(): WithExchangeInfoType {
    return {
      timestamp: this.timestamp,
      payload: this.creation.what.payload
    };
  }

  withUserAccount(): WithUserAccountType {
    const { commission } = this.creation.what.options;

    return {
      timestamp: this.timestamp,
      payload: {
        makerCommission: commission.makerRate.mul(100).toNumber(),
        takerCommission: commission.takerRate.mul(100).toNumber(),
        balances: Object.values(this.balance).map(it => {
          const { asset, free, locked } = it.snapshot();

          return {
            asset,
            free: free.toString(),
            locked: locked.toString()
          };
        })
      }
    };
  }

  withOrderNew([order]: Parameters<typeof withOrderNewRequest>): WithOrderNewType {
    return {
      timestamp: this.timestamp,
      payload: this.symbol[order.symbol.toLowerCase()].orderNew(order)
    };
  }

  withOrderCancel([order]: Parameters<
    typeof withOrderCancelRequest
  >): WithOrderCancelType {
    return {
      timestamp: this.timestamp,
      payload: this.symbol[order.symbol.toLowerCase()].orderCancel([order])
    };
  }

  withOrders([symbol]: Parameters<typeof withOrdersRequest>): WithOrdersType {
    return {
      timestamp: this.timestamp,
      payload: this.symbol[symbol.toLowerCase()].snapshot().orders
    };
  }

  whenOrderbookTicker(
    [symbol]: Parameters<typeof whenOrderbookTickerSocket>,
    payload: WhenOrderbookTickerSocketType
  ) {
    this.apply({ type: 'orderbook-ticker-changed', what: { ...payload, symbol } });
  }

  whenOrderbookDepth(
    [symbol]: Parameters<typeof whenOrderbookDepthSocket>,
    payload: WhenOrderbookDepthSocketType
  ) {
    this.apply({ type: 'orderbook-depth-changed', what: { ...payload, symbol } });
  }

  whenTrade([symbol]: Parameters<typeof whenTradeSocket>, payload: WhenTradeSocketType) {
    this.apply({ type: 'trade-executed', what: { ...payload, symbol } });
  }

  apply(event: SimulatorEvent) {
    this.events.push(event);

    switch (event.type) {
      case 'created':
        this.creation.what.payload.symbols
          .flatMap(it => [it.baseAsset, it.quoteAsset])
          .forEach(it => {
            this.balance[it.toLowerCase()] = new SimulatorBalance(
              this,
              it,
              this.creation.what.options.balance[it.toLowerCase()]?.free ?? d.Zero
            );
          });
        this.creation.what.payload.symbols.forEach(it => {
          this.symbol[it.symbol.toLowerCase()] = new SimulatorSymbol(this, it);
        });
        break;
      case 'orderbook-ticker-changed':
      case 'orderbook-depth-changed':
      case 'trade-executed':
        this.timestamp = event.what.timestamp;
        this.ticks++;

        if (!this.duration.from) {
          this.duration.from = this.timestamp;
        }
        this.duration.to = this.timestamp;

        this.symbol[event.what.symbol.toLowerCase()].apply(event);
        break;
      case 'symbol-order-new':
        this.symbol[event.what.symbol.toLowerCase()].apply(event);
        break;
      case 'symbol-order-cancel':
      case 'symbol-order-updated':
        this.symbol[event.what.order.symbol.toLowerCase()].apply(event);
        break;
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      duration: this.duration,
      ticks: this.ticks,
      balances: Object.values(this.balance).map(it => it.snapshot())
    };
  }

  flush() {
    return this.events.splice(0, this.events.length);
  }
}
