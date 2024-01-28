import { Asset, d, decimal } from '@quantform/core';

import { SimulatorEvent } from './simulator';

export type SimulatorBalanceEvent = {
  type: 'simulator-inventory-balance-changed';
  timestamp: number;
  asset: Asset;
  free: decimal;
  locked: decimal;
};

export class SimulatorInventory {
  private timestamp = 0;
  private free = d.Zero;
  private locked = d.Zero;

  constructor(
    private readonly root: { apply: (event: SimulatorEvent) => void },
    readonly asset: Asset,
    free: decimal
  ) {
    this.free = free;
  }

  has(quantity: decimal) {
    return this.free.gte(quantity);
  }

  // eslint-disable-next-line complexity
  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'simulator-inventory-balance-changed':
        if (event.asset === this.asset) {
          if (event.free.lt(d.Zero)) {
            throw new Error(`free quantity cannot be negative`);
          }

          if (event.locked.lt(d.Zero)) {
            throw new Error(`locked quantity cannot be negative`);
          }

          this.free = event.free;
          this.locked = event.locked;
        }
        break;
      case 'simulator-instrument-order-settled':
        if (!event.order.price) {
          return;
        }

        if (event.order.instrument.base.id === this.asset.id) {
          if (event.order.quantity.lt(d.Zero)) {
            const quantity = event.order.quantity.abs();

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.sub(quantity),
              locked: this.locked.add(quantity)
            });
          }
        }

        if (event.order.instrument.quote.id === this.asset.id) {
          if (event.order.quantity.gt(d.Zero)) {
            const quantity = event.order.quantity.abs().mul(event.order.price);

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.sub(quantity),
              locked: this.locked.add(quantity)
            });
          }
        }
        break;
      case 'simulator-instrument-order-trade':
        if (event.order.instrument.base.id === this.asset.id) {
          if (event.order.quantity.gt(d.Zero)) {
            const quantity = event.trade.quantity.abs();

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.add(quantity),
              locked: this.locked
            });
          }

          if (event.order.quantity.lt(d.Zero)) {
            const free = event.order.price ? d.Zero : event.trade.quantity.abs();
            const locked = event.order.price ? event.trade.quantity.abs() : d.Zero;

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.sub(free),
              locked: this.locked.sub(locked)
            });
          }
        }

        if (event.order.instrument.quote.id === this.asset.id) {
          if (event.order.quantity.gt(d.Zero)) {
            const quantity = event.trade.quantity.abs().mul(event.trade.price);
            const free = event.order.price ? d.Zero : quantity;
            const locked = event.order.price ? quantity : d.Zero;

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.add(free),
              locked: this.locked.sub(locked)
            });
          }

          if (event.order.quantity.lt(d.Zero)) {
            const quantity = event.trade.quantity.abs().mul(event.trade.price);

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.add(quantity),
              locked: this.locked
            });
          }
        }
        break;
      case 'simulator-instrument-order-canceled':
        if (!event.order.price) {
          return;
        }

        if (event.order.instrument.base.id === this.asset.id) {
          if (event.order.quantity.lt(d.Zero)) {
            const quantity = event.order.quantity.abs().sub(event.order.executedQuantity);

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.add(quantity),
              locked: this.locked.sub(quantity)
            });
          }
        }

        if (event.order.instrument.quote.id === this.asset.id) {
          if (event.order.quantity.gt(d.Zero)) {
            const quantity = event.order.quantity
              .abs()
              .sub(event.order.executedQuantity)
              .mul(event.order.price);

            this.root.apply({
              type: 'simulator-inventory-balance-changed',
              timestamp: event.timestamp,
              asset: this.asset,
              free: this.free.add(quantity),
              locked: this.locked.sub(quantity)
            });
          }
        }
        break;
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      asset: this.asset,
      free: this.free,
      locked: this.locked
    };
  }
}
