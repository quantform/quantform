import { Instrument } from '@quantform/core';

import { Simulator, SimulatorEvent, SimulatorWithEvent } from './simulator';
import { SimulatorBalance } from './simulator-balance';

export class SimulatorInstrument {
  private numberOfOrders = 1;

  constructor(
    private readonly root: Simulator,
    private readonly instrument: Instrument,
    private readonly balance: { base: SimulatorBalance; quote: SimulatorBalance }
  ) {}

  apply(event: SimulatorEvent) {
    switch (event.type) {
      case 'when-orderbook-ticker':
        break;
      case 'when-trade':
        break;
    }
  }

  newOrder({
    args: [order],
    correlationId
  }: Extract<SimulatorEvent, { type: 'with-order-new-command' }>) {
    const { base, quote } = this.balance;

    if (!base.tryLock(order.quantity.abs())) {
      return;
    }

    //if (!quote.tryLock(order.quantity.abs().mul(order.rate))) {
    //  return;
    //}

    this.numberOfOrders++;

    this.root.apply({
      type: 'with-order-new-response',
      correlationId,
      payload: {
        timestamp: 0,
        payload: {
          orderId: this.numberOfOrders,
          status: 'NEW'
        }
      }
    });
  }

  with(event: SimulatorWithEvent, timestamp: number): SimulatorWithEvent | undefined {
    switch (event.type) {
      case 'with-order-new-command':
        return {
          type: 'with-order-new-response',
          correlationId: event.correlationId,
          payload: {
            timestamp: timestamp,
            payload: {
              orderId: 1,
              status: 'NEW'
            }
          }
        };
        break;
    }

    return undefined;
  }

  snapshot() {
    return {
      instrument: this.instrument
    };
  }
}
