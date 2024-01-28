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
import { Asset, d, InferObservableType } from '@quantform/core';

import { SimulatorInstrument, SimulatorInstrumentEvent } from './simulator-instrument';
import { SimulatorBalanceEvent, SimulatorInventory } from './simulator-inventory';
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
  | SimulatorInstrumentEvent;

export class Simulator {
  private timestamp = 0;
  private ticks = 0;
  private events: SimulatorEvent[] = [];
  private readonly balance: Record<string, SimulatorInventory> = {};
  private readonly symbol: Record<string, SimulatorInstrument> = {};
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
            asset: asset.name,
            free: free.toString(),
            locked: locked.toString()
          };
        })
      }
    };
  }

  withOrderNew([order]: Parameters<typeof withOrderNewRequest>): WithOrderNewType {
    const newOrder = this.symbol[order.symbol.toLowerCase()].orderNew(order);

    return {
      timestamp: this.timestamp,
      payload: {
        orderId: newOrder.id,
        status: newOrder.status
      }
    };
  }

  withOrderCancel([order]: Parameters<
    typeof withOrderCancelRequest
  >): WithOrderCancelType {
    const cancelOrder = this.symbol[order.symbol.toLowerCase()].orderCancel([order]);

    return {
      timestamp: this.timestamp,
      payload: {
        symbol: order.symbol,
        orderId: cancelOrder.id,
        origClientOrderId: cancelOrder.clientOrderId,
        clientOrderId: cancelOrder.clientOrderId,
        price: cancelOrder.price?.toString(),
        origQty: cancelOrder.quantity.toString(),
        executedQty: cancelOrder.executedQuantity.toString(),
        cummulativeQuoteQty: cancelOrder.cumulativeQuoteQuantity.toString(),
        status: cancelOrder.status,
        timeInForce: 'GTC',
        type: cancelOrder.price ? 'LIMIT' : 'MARKET',
        side: cancelOrder.quantity.gt(d.Zero) ? 'BUY' : 'SELL'
      }
    };
  }

  withOrders([symbol]: Parameters<typeof withOrdersRequest>): WithOrdersType {
    return {
      timestamp: this.timestamp,
      payload: this.symbol[symbol.toLowerCase()].snapshot().orders.map(it => ({
        symbol,
        orderId: it.id,
        clientOrderId: it.clientOrderId,
        price: it.price?.toString(),
        origQty: it.quantity.toString(),
        executedQty: it.executedQuantity.toString(),
        cummulativeQuoteQty: it.cumulativeQuoteQuantity.toString(),
        status: it.status,
        timeInForce: 'GTC',
        type: it.price ? 'LIMIT' : 'MARKET',
        side: it.quantity.gt(d.Zero) ? 'BUY' : 'SELL',
        stopPrice: undefined,
        icebergQty: undefined,
        time: it.timestamp,
        updateTime: it.timestamp,
        isWorking: true
      }))
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

  // eslint-disable-next-line complexity
  apply(event: SimulatorEvent) {
    this.events.push(event);

    switch (event.type) {
      case 'created':
        this.creation.what.payload.symbols
          .flatMap(it => [it.baseAsset, it.quoteAsset])
          .forEach(it => {
            this.balance[it.toLowerCase()] = new SimulatorInventory(
              this,
              new Asset(it, 'binance', 8),
              this.creation.what.options.balance[it.toLowerCase()]?.free ?? d.Zero
            );
          });
        this.creation.what.payload.symbols.forEach(it => {
          this.symbol[it.symbol.toLowerCase()] = new SimulatorInstrument(this, it);
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
      case 'simulator-inventory-balance-changed':
        break;
      case 'simulator-instrument-order-requested':
      case 'simulator-instrument-order-settled':
      case 'simulator-instrument-order-trade':
      case 'simulator-instrument-order-filled':
      case 'simulator-instrument-order-canceled':
      case 'simulator-instrument-order-rejected':
        this.balance[event.instrument.base.name.toLowerCase()].apply(event);
        this.balance[event.instrument.quote.name.toLowerCase()].apply(event);
        this.symbol[event.instrument.raw.toLowerCase()].apply(event);
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
