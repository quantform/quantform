import { d, decimal } from '@quantform/core';

import { MatchingEnginePriceLevel } from './matching-engine-price-level';

interface MatchingEngineDepthMakerOrder {
  id: number;
  price: decimal;
  quantity: decimal;
}

interface MatchingEngineDepthTakerOrder {
  id: number;
  price?: decimal;
  quantity: decimal;
}

export interface PriceLevelTrade {
  price: decimal;
  quantity: decimal;
  makerOrderId: number;
  takerOrderId: number;
}

export class MatchingEngineDepth {
  private levels: MatchingEnginePriceLevel[] = [];
  private cumulativeQuantity = d.Zero;

  constructor(private readonly side: 'BID' | 'ASK') {}

  enqueue(makerOrder: MatchingEngineDepthMakerOrder) {
    let level = this.levels.find(level => level.price.eq(makerOrder.price));

    if (!level) {
      level = new MatchingEnginePriceLevel(makerOrder.price);
      this.levels.push(level);
      this.levels.sort((a, b) => a.price.cmp(b.price));

      if (this.side === 'BID') {
        this.levels = this.levels.reverse();
      }
    }

    level.enqueue({ id: makerOrder.id, quantity: makerOrder.quantity });

    this.cumulativeQuantity = this.cumulativeQuantity.add(makerOrder.quantity);
  }

  dequeue({ id }: { id: number }) {
    for (const level of this.levels) {
      const order = level.dequeue({ id });

      if (order != 'REJECTED') {
        this.cumulativeQuantity = this.cumulativeQuantity.minus(order.quantityLeft);

        this.levels = this.levels.filter(it =>
          it.snapshot().cumulativeQuantity.gt(d.Zero)
        );

        return order;
      }
    }

    return 'REJECTED';
  }

  // eslint-disable-next-line complexity
  trade(takerOrder: MatchingEngineDepthTakerOrder): PriceLevelTrade[] | 'REJECTED' {
    if (!takerOrder.price && takerOrder.quantity.gt(this.cumulativeQuantity)) {
      return 'REJECTED';
    }

    let quantityLeft = takerOrder.quantity;

    const trades: PriceLevelTrade[] = [];

    for (const level of this.levels) {
      if (takerOrder.price) {
        if (this.side === 'BID' && level.price.lt(takerOrder.price)) {
          continue;
        }
        if (this.side === 'ASK' && level.price.gt(takerOrder.price)) {
          continue;
        }
      }

      const levelTrades = level.trade({ id: takerOrder.id, quantity: quantityLeft });
      const levelTradesConsumedQuantity = levelTrades.reduce(
        (acc, trade) => acc.add(trade.quantity),
        d.Zero
      );

      if (level.snapshot().cumulativeQuantity.eq(d.Zero)) {
        this.levels = this.levels.filter(l => l !== level);
      }

      trades.push(...levelTrades);

      quantityLeft = quantityLeft.sub(levelTradesConsumedQuantity);

      this.cumulativeQuantity = this.cumulativeQuantity.sub(levelTradesConsumedQuantity);

      if (quantityLeft.eq(d.Zero)) {
        break;
      }
    }

    return trades;
  }

  snapshot() {
    return {
      cumulativeQuantity: this.cumulativeQuantity,
      levels: this.levels.map(level => level.snapshot())
    };
  }
}
