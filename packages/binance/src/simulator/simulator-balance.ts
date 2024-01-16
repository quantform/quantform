import { Asset, d, decimal } from '@quantform/core';

import { Simulator, SimulatorEvent } from './simulator';

export class SimulatorBalance {
  private timestamp = 0;
  private free = d.Zero;
  private locked = d.Zero;

  constructor(
    private readonly root: Simulator,
    private readonly asset: Asset,
    free: decimal
  ) {
    this.free = free;
  }

  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'when-orderbook-ticker':
        break;
      case 'when-trade':
        break;
    }
  }

  tryLock(quantity: decimal) {
    if (this.free.lt(quantity)) {
      return false;
    }

    this.free = this.free.sub(quantity);
    this.locked = this.locked.add(quantity);

    return true;
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
