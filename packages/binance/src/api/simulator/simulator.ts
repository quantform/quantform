import { v4 } from 'uuid';

import { withExchangeInfoRequest } from '@lib/api';
import { Asset, d, decimal, InferObservableType } from '@quantform/core';

import { SimulatorInstrument, SimulatorInstrumentEvent } from './simulator-instrument';
import { SimulatorBalanceEvent, SimulatorInventory } from './simulator-inventory';
import { useSimulatorOptions } from './use-simulator-options';

export type WithExchangeInfoType = InferObservableType<
  ReturnType<typeof withExchangeInfoRequest>
>;
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

  snapshot() {
    return {
      timestamp: this.timestamp,
      duration: this.duration,
      ticks: this.ticks,
      commission: this.creation.what.options.commission,
      balances: Object.values(this.balance).map(it => it.snapshot()),
      instruments: Object.values(this.symbol).map(it => it.snapshot())
    };
  }

  withExchangeInfo(): WithExchangeInfoType {
    return {
      timestamp: this.timestamp,
      payload: this.creation.what.payload
    };
  }

  orderNew(order: {
    customId?: string;
    symbol: string;
    quantity: decimal;
    price?: decimal;
  }) {
    return this.symbol[order.symbol.toLowerCase()].orderNew({
      customId: order.customId ?? v4(),
      quantity: order.quantity,
      price: order.price
    });
  }

  orderCancel(order: { symbol: string; id?: number; customId?: string }) {
    return this.symbol[order.symbol.toLowerCase()].orderCancel(order);
  }

  tick({
    timestamp,
    symbol,
    bid,
    ask
  }: {
    timestamp: number;
    symbol: string;
    bid: { rate: decimal; quantity: decimal };
    ask: { rate: decimal; quantity: decimal };
  }) {
    return this.symbol[symbol.toLowerCase()].tick(timestamp, bid, ask);
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
      case 'simulator-instrument-tick':
        this.timestamp = event.timestamp;
        this.ticks++;

        if (!this.duration.from) {
          this.duration.from = this.timestamp;
        }
        this.duration.to = this.timestamp;

        this.symbol[
          `${event.instrument.base.name.toLowerCase()}${event.instrument.quote.name.toLowerCase()}`
        ].apply(event);
        break;
      case 'simulator-inventory-balance-changed':
        this.balance[event.asset.name.toLowerCase()].apply(event);
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

  flush() {
    return this.events.splice(0, this.events.length);
  }
}
