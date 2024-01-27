import { d, decimal } from '@quantform/core';

import { MatchingEngineDepth } from './matching-engine-depth';

interface MatchingEngineOrder {
  id: number;
  price?: decimal;
  quantity: decimal;
}

export interface MatchingEngineTrade {
  makerOrderId: number;
  takerOrderId: number;
  quantity: decimal;
  price: decimal;
}

export class MatchingEngine {
  private bid: MatchingEngineDepth = new MatchingEngineDepth('BID');
  private ask: MatchingEngineDepth = new MatchingEngineDepth('ASK');

  enqueue(
    order: MatchingEngineOrder,
    side: 'BUY' | 'SELL'
  ): MatchingEngineTrade[] | 'REJECTED' {
    const depth = side === 'BUY' ? this.ask : this.bid;

    const { cumulativeQuantity } = depth.snapshot();

    if (!order.price && cumulativeQuantity.lt(order.quantity)) {
      return 'REJECTED';
    }

    const result = depth.trade({
      id: order.id,
      quantity: order.quantity,
      price: order.price
    });

    if (result === 'REJECTED') {
      return 'REJECTED';
    }

    const tradeCumulativeQuantity = result.reduce(
      (acc, trade) => acc.add(trade.quantity),
      d.Zero
    );

    const quantityLeft = order.quantity.minus(tradeCumulativeQuantity);

    if (quantityLeft.gt(d.Zero) && order.price) {
      const depth = side === 'BUY' ? this.bid : this.ask;

      depth.enqueue({ id: order.id, quantity: quantityLeft, price: order.price });
    }

    return result;
  }

  dequeue(order: { id: number }, side: 'BUY' | 'SELL') {
    const depth = side === 'BUY' ? this.bid : this.ask;

    return depth.dequeue(order);
  }

  snapshot() {
    return {
      bid: this.bid.snapshot(),
      ask: this.ask.snapshot()
    };
  }
}
