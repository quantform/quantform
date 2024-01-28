import { v4 } from 'uuid';

import { withOrderCancelRequest, withOrderNewRequest } from '@lib/api';
import { Asset, Commission, d, decimal, Instrument } from '@quantform/core';

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

  orderNew(newOrder: Parameters<typeof withOrderNewRequest>[0]): Order {
    const orderId = this.orderCounter++;

    this.root.apply({
      type: 'simulator-instrument-order-requested',
      instrument: this.instrument,
      id: orderId,
      clientOrderId: newOrder.newClientOrderId || v4(),
      quantity:
        newOrder.side === 'BUY' ? d(newOrder.quantity) : d(newOrder.quantity).neg(),
      price: newOrder.price ? d(newOrder.price) : undefined
    });

    const order = this.orders[orderId];

    return order;
  }

  orderCancel([{ orderId, origClientOrderId }]: Parameters<
    typeof withOrderCancelRequest
  >): Order {
    const order = Object.values(this.orders).find(
      it => it.id === orderId || it.clientOrderId === origClientOrderId
    );

    if (!order) {
      throw new Error(`missing order for: ${orderId}`);
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
      case 'orderbook-ticker-changed':
        this.timestamp = event.what.timestamp;

        this.matchingEngine.dequeue({ id: -1 }, 'SELL');
        this.matchingEngine.dequeue({ id: -1 }, 'BUY');

        this.onTrade(
          this.matchingEngine.enqueue(
            { id: -1, quantity: d(event.what.payload.A), price: d(event.what.payload.a) },
            'SELL'
          )
        );
        this.onTrade(
          this.matchingEngine.enqueue(
            { id: -1, quantity: d(event.what.payload.B), price: d(event.what.payload.b) },
            'BUY'
          )
        );
        break;
      case 'orderbook-depth-changed':
        this.timestamp = event.what.timestamp;

        this.matchingEngine.dequeue({ id: -1 }, 'SELL');
        this.matchingEngine.dequeue({ id: -1 }, 'BUY');

        this.onTrade(
          this.matchingEngine.enqueue(
            {
              id: -1,
              quantity: d(event.what.payload.asks[0][1]),
              price: d(event.what.payload.asks[0][0])
            },
            'SELL'
          )
        );
        this.onTrade(
          this.matchingEngine.enqueue(
            {
              id: -1,
              quantity: d(event.what.payload.bids[0][1]),
              price: d(event.what.payload.bids[0][0])
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

        if (event.order.quantity.eq(event.order.executedQuantity)) {
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
