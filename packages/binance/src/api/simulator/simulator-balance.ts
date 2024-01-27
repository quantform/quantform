import { d, decimal } from '@quantform/core';

import { SimulatorEvent } from './simulator';

export type SimulatorBalanceEvent = {
  type: 'balance-changed';
  what: { asset: string; free: decimal; locked: decimal };
};

export class SimulatorBalance {
  private timestamp = 0;
  private free = d.Zero;
  private locked = d.Zero;

  constructor(
    private readonly root: { apply: (event: SimulatorEvent) => void },
    private readonly asset: string,
    free: decimal
  ) {
    this.free = free;
  }

  has(quantity: decimal) {
    return this.free.gte(quantity);
  }

  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'symbol-order-new':
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
