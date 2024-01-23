import { v4 } from 'uuid';

import { withOrderCancelRequest, withOrderNewRequest, withOrdersRequest } from '@lib/api';
import { d, decimal, InferObservableType } from '@quantform/core';

import {
  CreationEvent,
  SimulatorEvent,
  WithOrderCancelType,
  WithOrderNewType
} from './simulator';
import { SimulatorBalance } from './simulator-balance';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Order = Unpacked<
  InferObservableType<ReturnType<typeof withOrdersRequest>>['payload']
>;

export type SimulatorSymbolEvent =
  | {
      type: 'symbol-order-new';
      what: { order: Order };
    }
  | {
      type: 'symbol-order-cancel';
      what: { order: Order };
    }
  | {
      type: 'symbol-order-updated';
      what: { order: Order };
    };

export class SimulatorSymbol {
  private timestamp = 0;
  private rate?: { bid: decimal; ask: decimal };
  private orders: Order[] = [];

  constructor(
    private readonly root: { apply(event: SimulatorEvent): void },
    private readonly metadata: Unpacked<CreationEvent['what']['payload']['symbols']>,
    private readonly base: SimulatorBalance,
    private readonly quote: SimulatorBalance
  ) {}

  orderNew([order]: Parameters<typeof withOrderNewRequest>): WithOrderNewType['payload'] {
    if (!this.rate) {
      throw new Error('not ready');
    }

    if (order.side === 'SELL' && !this.base.has(d(order.quantity))) {
      throw new Error('insufficient funds');
    }

    const rate = order.price
      ? d(order.price)
      : order.side === 'BUY'
      ? this.rate.ask
      : this.rate.bid;

    if (order.side === 'BUY' && !this.quote.has(d(order.quantity).mul(d(rate)))) {
      throw new Error('insufficient funds');
    }

    const orderId = this.orders.length + 1;

    this.root.apply({
      type: 'symbol-order-new',
      what: {
        order: {
          orderId,
          clientOrderId: order.newClientOrderId ?? v4(),
          symbol: this.metadata.symbol,
          type: order.type,
          origQty: order.quantity.toString(),
          executedQty: '0',
          cummulativeQuoteQty: '0',
          side: order.side,
          icebergQty: '0',
          stopPrice: '0',
          timeInForce: order.timeInForce,
          updateTime: this.timestamp,
          price: rate.toString(),
          status: 'NEW',
          time: this.timestamp
        }
      }
    });

    return {
      orderId,
      status: 'NEW'
    };
  }

  orderCancel([{ orderId, origClientOrderId }]: Parameters<
    typeof withOrderCancelRequest
  >): WithOrderCancelType['payload'] {
    const order = this.orders.find(
      it => it.orderId === orderId || it.clientOrderId === origClientOrderId
    );

    if (!order) {
      throw new Error('Order not found');
    }

    this.root.apply({
      type: 'symbol-order-cancel',
      what: { order }
    });

    return {
      ...order,
      origClientOrderId: order.clientOrderId
    };
  }

  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'orderbook-ticker-changed':
        this.rate = {
          bid: d(event.what.payload.b),
          ask: d(event.what.payload.a)
        };
        break;
      case 'orderbook-depth-changed':
        this.rate = {
          bid: d(event.what.payload.bids[0][0]),
          ask: d(event.what.payload.asks[0][0])
        };
        break;
      case 'symbol-order-new':
        this.orders.push(event.what.order);
        break;
      case 'symbol-order-cancel':
        this.orders = this.orders.filter(it => it.orderId !== event.what.order.orderId);
        break;
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      orders: this.orders
    };
  }
}
