import { d, decimal } from '@quantform/core';

export interface PriceLevelOrder {
  id: number;
  quantityLeft: decimal;
}

export interface PriceLevelTrade {
  price: decimal;
  quantity: decimal;
  makerOrderId: number;
  takerOrderId: number;
}

export class MatchingEnginePriceLevel {
  private readonly orders: PriceLevelOrder[] = [];
  private cumulativeQuantity = d.Zero;

  constructor(readonly price: decimal) {}

  enqueue(makerOrder: { id: number; quantity: decimal }) {
    this.orders.push({ id: makerOrder.id, quantityLeft: makerOrder.quantity });

    this.cumulativeQuantity = this.cumulativeQuantity.add(makerOrder.quantity);
  }

  dequeue({ id }: { id: number }) {
    const index = this.orders.findIndex(makerOrder => makerOrder.id === id);

    if (index === -1) {
      return 'REJECTED';
    }

    const order = this.orders[index];

    this.cumulativeQuantity = this.cumulativeQuantity.minus(order.quantityLeft);

    this.orders.splice(index, 1);

    return order;
  }

  trade(takerOrder: { id: number; quantity: decimal }): PriceLevelTrade[] {
    let quantityLeft = takerOrder.quantity;

    const trades: PriceLevelTrade[] = [];

    while (quantityLeft.gt(d.Zero) && this.orders.length > 0) {
      const makerOrder = this.orders[0];
      const consumedQuantity = decimal.min(makerOrder.quantityLeft, quantityLeft);

      makerOrder.quantityLeft = makerOrder.quantityLeft.sub(consumedQuantity);
      quantityLeft = quantityLeft.sub(consumedQuantity);

      trades.push({
        makerOrderId: makerOrder.id,
        takerOrderId: takerOrder.id,
        price: this.price,
        quantity: consumedQuantity
      });

      this.cumulativeQuantity = this.cumulativeQuantity.sub(consumedQuantity);

      if (makerOrder.quantityLeft.eq(d.Zero)) {
        this.orders.shift();
      }
    }

    return trades;
  }

  snapshot() {
    return {
      price: this.price,
      cumulativeQuantity: this.cumulativeQuantity,
      orders: this.orders
    };
  }
}
