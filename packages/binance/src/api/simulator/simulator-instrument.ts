import {
  Asset,
  Commission,
  d,
  decimal,
  Instrument,
  InstrumentSelector
} from '@quantform/core';

import { MatchingEngine, MatchingEngineTrade } from './matching-engine/matching-engine';
import { CreationEvent, SimulatorEvent } from './simulator';

type Unpacked<T> = T extends (infer U)[] ? U : T;

export interface Order {
  timestamp: number;
  id: number;
  clientOrderId: string;
  instrument: Instrument;
  quantity: decimal;
  executedQuantity: decimal;
  cumulativeQuoteQuantity: decimal;
  price?: decimal;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';
}

export interface OrderTrade {
  price: decimal;
  quantity: decimal;
  makerOrderId: number;
  takerOrderId: number;
}

export type SimulatorInstrumentEvent =
  | {
      type: 'simulator-instrument-tick';
      timestamp: number;
      instrument: InstrumentSelector;
      bid: { rate: decimal; quantity: decimal };
      ask: { rate: decimal; quantity: decimal };
    }
  | {
      type: 'simulator-instrument-order-requested';
      instrument: Instrument;
      id: number;
      clientOrderId: string;
      quantity: decimal;
      price?: decimal;
    }
  | {
      type: 'simulator-instrument-order-settled';
      timestamp: number;
      instrument: Instrument;
      order: Readonly<Order>;
    }
  | {
      type: 'simulator-instrument-order-trade';
      timestamp: number;
      instrument: Instrument;
      order: Readonly<Order>;
      trade: Readonly<OrderTrade>;
    }
  | {
      type: 'simulator-instrument-order-filled';
      timestamp: number;
      instrument: Instrument;
      order: Readonly<Order>;
    }
  | {
      type: 'simulator-instrument-order-canceled';
      timestamp: number;
      instrument: Instrument;
      order: Readonly<Order>;
    }
  | {
      type: 'simulator-instrument-order-rejected';
      timestamp: number;
      instrument: Instrument;
      order: Readonly<Order>;
    };

export class SimulatorInstrument {
  private timestamp = 0;
  private orderCounter = 0;
  private orders: Record<number, Order> = {};
  private readonly instrument: Instrument;
  private readonly matchingEngine = new MatchingEngine();

  constructor(
    private readonly root: { apply(event: SimulatorEvent): void },
    metadata: Unpacked<CreationEvent['what']['payload']['symbols']>
  ) {
    const scale = { base: 8, quote: 8 };

    for (const filter of metadata.filters) {
      switch (filter.filterType) {
        case 'PRICE_FILTER':
          scale.quote = d(filter.tickSize).decimalPlaces();
          break;
        case 'LOT_SIZE':
          scale.base = d(filter.stepSize).decimalPlaces();
          break;
      }
    }

    this.instrument = new Instrument(
      0,
      new Asset(metadata.baseAsset, 'binance', scale.base),
      new Asset(metadata.quoteAsset, 'binance', scale.quote),
      metadata.symbol,
      Commission.Zero
    );
  }

  tick(
    timestamp: number,
    bid: { rate: decimal; quantity: decimal },
    ask: { rate: decimal; quantity: decimal }
  ) {
    this.root.apply({
      type: 'simulator-instrument-tick',
      timestamp,
      instrument: this.instrument,
      bid,
      ask
    });
  }

  orderNew({
    customId,
    quantity,
    price
  }: {
    customId: string;
    quantity: decimal;
    price?: decimal;
  }): Order {
    const orderId = this.orderCounter++;

    this.root.apply({
      type: 'simulator-instrument-order-requested',
      instrument: this.instrument,
      id: orderId,
      clientOrderId: customId,
      quantity,
      price
    });

    const order = this.orders[orderId];

    return order;
  }

  orderCancel({ id, customId }: { id?: number; customId?: string }): Order {
    const order = Object.values(this.orders).find(
      it => it.id === id || it.clientOrderId === customId
    );

    if (!order) {
      throw new Error(`missing order for: ${id}, ${customId}`);
    }

    this.root.apply({
      type: 'simulator-instrument-order-canceled',
      timestamp: this.timestamp,
      instrument: this.instrument,
      order
    });

    return order;
  }

  // eslint-disable-next-line complexity
  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'simulator-instrument-tick':
        this.timestamp = event.timestamp;

        this.matchingEngine.dequeue({ id: -1 }, 'SELL');
        this.matchingEngine.dequeue({ id: -1 }, 'BUY');

        this.onTrade(
          this.matchingEngine.enqueue(
            {
              id: -1,
              quantity: event.ask.quantity,
              price: event.ask.rate
            },
            'SELL'
          )
        );
        this.onTrade(
          this.matchingEngine.enqueue(
            {
              id: -1,
              quantity: event.bid.quantity,
              price: event.bid.rate
            },
            'BUY'
          )
        );
        break;
      case 'simulator-instrument-order-requested':
        this.orders[event.id] = {
          timestamp: this.timestamp,
          id: event.id,
          clientOrderId: event.clientOrderId,
          instrument: this.instrument,
          quantity: event.quantity,
          executedQuantity: d.Zero,
          cumulativeQuoteQuantity: d.Zero,
          price: event.price,
          status: 'NEW'
        };

        const order = this.matchingEngine.enqueue(
          {
            id: event.id,
            quantity: event.quantity.abs(),
            price: event.price
          },
          event.quantity.gt(0) ? 'BUY' : 'SELL'
        );

        if (order === 'REJECTED') {
          this.orders[event.id].status = 'REJECTED';

          this.root.apply({
            type: 'simulator-instrument-order-rejected',
            timestamp: this.timestamp,
            instrument: this.instrument,
            order: { ...this.orders[event.id] }
          });
        } else {
          this.root.apply({
            type: 'simulator-instrument-order-settled',
            timestamp: this.timestamp,
            instrument: this.instrument,
            order: { ...this.orders[event.id] }
          });

          this.onTrade(order);
        }

        break;
      case 'simulator-instrument-order-settled':
        break;
      case 'simulator-instrument-order-trade':
        this.orders[event.order.id].status = 'PARTIALLY_FILLED';
        this.orders[event.order.id].executedQuantity = event.order.executedQuantity;
        this.orders[event.order.id].cumulativeQuoteQuantity =
          event.order.cumulativeQuoteQuantity;

        if (event.order.quantity.abs().eq(event.order.executedQuantity)) {
          this.orders[event.order.id].status = 'FILLED';

          this.root.apply({
            type: 'simulator-instrument-order-filled',
            timestamp: this.timestamp,
            instrument: this.instrument,
            order: { ...this.orders[event.order.id] }
          });
        }
        break;
      case 'simulator-instrument-order-filled':
        break;
      case 'simulator-instrument-order-canceled':
        this.matchingEngine.dequeue(
          { id: event.order.id },
          event.order.quantity.gt(0) ? 'BUY' : 'SELL'
        );

        this.orders[event.order.id].status = 'CANCELED';
        break;
    }
  }

  private onTrade(trade: MatchingEngineTrade[] | 'REJECTED') {
    if (trade === 'REJECTED') {
      return;
    }

    for (const { makerOrderId, takerOrderId, price, quantity } of trade) {
      const takerOrder = this.orders[takerOrderId];
      if (takerOrder) {
        this.root.apply({
          type: 'simulator-instrument-order-trade',
          timestamp: this.timestamp,
          instrument: this.instrument,
          trade: { makerOrderId, takerOrderId, price, quantity },
          order: {
            ...takerOrder,
            status: 'PARTIALLY_FILLED',
            executedQuantity: takerOrder.executedQuantity.add(quantity),
            cumulativeQuoteQuantity: takerOrder.cumulativeQuoteQuantity.add(
              price.mul(quantity)
            )
          }
        });
      }

      const makerOrder = this.orders[makerOrderId];
      if (makerOrder) {
        this.root.apply({
          type: 'simulator-instrument-order-trade',
          timestamp: this.timestamp,
          instrument: this.instrument,
          trade: { makerOrderId, takerOrderId, price, quantity },
          order: {
            ...makerOrder,
            status: 'PARTIALLY_FILLED',
            executedQuantity: makerOrder.executedQuantity.add(quantity),
            cumulativeQuoteQuantity: makerOrder.cumulativeQuoteQuantity.add(
              price.mul(quantity)
            )
          }
        });
      }
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      orders: Object.values(this.orders)
    };
  }
}
