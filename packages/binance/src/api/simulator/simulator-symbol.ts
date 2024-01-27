import { v4 } from 'uuid';

import { withOrderCancelRequest, withOrderNewRequest, withOrdersRequest } from '@lib/api';
import { d, InferObservableType } from '@quantform/core';

import { MatchingEngine, MatchingEngineTrade } from './matching-engine/matching-engine';
import {
  CreationEvent,
  SimulatorEvent,
  WithOrderCancelType,
  WithOrderNewType
} from './simulator';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Order = Unpacked<
  InferObservableType<ReturnType<typeof withOrdersRequest>>['payload']
>;

export type SimulatorSymbolEvent =
  | {
      type: 'symbol-order-new';
      what: Parameters<typeof withOrderNewRequest>['0'] & {
        orderId: number;
      };
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
  private orderCounter = 0;
  private orders: Record<number, Order> = {};
  private readonly balance = { base: d.Zero, quote: d.Zero };
  private readonly matchingEngine = new MatchingEngine();

  constructor(
    private readonly root: { apply(event: SimulatorEvent): void },
    private readonly metadata: Unpacked<CreationEvent['what']['payload']['symbols']>
  ) {}

  orderNew(
    newOrder: Parameters<typeof withOrderNewRequest>[0]
  ): WithOrderNewType['payload'] {
    const orderId = this.orderCounter++;

    this.root.apply({
      type: 'symbol-order-new',
      what: { ...newOrder, orderId }
    });

    const order = this.orders[orderId];

    return {
      orderId,
      status: order.status
    };
  }

  orderCancel([{ orderId, origClientOrderId }]: Parameters<
    typeof withOrderCancelRequest
  >): WithOrderCancelType['payload'] {
    const order = Object.values(this.orders).find(
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

  // eslint-disable-next-line complexity
  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'balance-changed':
        if (event.what.asset === this.metadata.baseAsset) {
          this.balance.base = event.what.free;
        }
        if (event.what.asset === this.metadata.quoteAsset) {
          this.balance.quote = event.what.free;
        }
        break;
      case 'orderbook-ticker-changed':
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
      case 'symbol-order-new':
        this.orders[event.what.orderId] = {
          orderId: event.what.orderId,
          clientOrderId: event.what.newClientOrderId ?? v4(),
          status: 'NEW',
          cummulativeQuoteQty: '0',
          executedQty: '0',
          origQty: event.what.quantity,
          price: event.what.price,
          side: event.what.side,
          symbol: event.what.symbol,
          timeInForce: event.what.timeInForce,
          type: event.what.type,
          time: this.timestamp
        };

        const order = this.matchingEngine.enqueue(
          {
            id: event.what.orderId,
            quantity: d(event.what.quantity),
            price: event.what.price ? d(event.what.price) : undefined
          },
          event.what.side
        );

        if (order === 'REJECTED') {
          this.root.apply({
            type: 'symbol-order-updated',
            what: {
              order: {
                ...this.orders[event.what.orderId],
                status: 'REJECTED'
              }
            }
          });

          return;
        }

        this.onTrade(order);
        break;
      case 'symbol-order-updated':
        this.orders[event.what.order.orderId] = event.what.order;
        break;
      case 'symbol-order-cancel':
        this.matchingEngine.dequeue(
          { id: event.what.order.orderId },
          event.what.order.side
        );

        delete this.orders[event.what.order.orderId];
        break;
    }
  }

  private onTrade(trade: MatchingEngineTrade[] | 'REJECTED') {
    if (trade === 'REJECTED') {
      return;
    }

    for (const { makerOrderId, takerOrderId, price, quantity } of trade) {
      const takerOrder = this.orders[takerOrderId];
      const makerOrder = this.orders[makerOrderId];

      if (takerOrder) {
        this.root.apply({
          type: 'symbol-order-updated',
          what: {
            order: {
              ...takerOrder,
              executedQty: d(takerOrder.executedQty).add(quantity).toString(),
              cummulativeQuoteQty: d(takerOrder.cummulativeQuoteQty)
                .add(price.mul(quantity))
                .toString(),
              status: d(takerOrder.origQty).eq(d(takerOrder.executedQty).add(quantity))
                ? 'FILLED'
                : 'PARTIALLY_FILLED'
            }
          }
        });
      }

      if (makerOrder) {
        this.root.apply({
          type: 'symbol-order-updated',
          what: {
            order: {
              ...makerOrder,
              executedQty: d(makerOrder.executedQty).add(quantity).toString(),
              cummulativeQuoteQty: d(makerOrder.cummulativeQuoteQty)
                .add(price.mul(quantity))
                .toString(),
              status: d(makerOrder.origQty).eq(d(makerOrder.executedQty).add(quantity))
                ? 'FILLED'
                : 'PARTIALLY_FILLED'
            }
          }
        });
      }
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      orders: Object.values(this.orders),
      balance: this.balance
    };
  }
}
