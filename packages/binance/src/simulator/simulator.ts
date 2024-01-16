import { Observable } from 'rxjs';

import { withBalancesType } from '@lib/balance';
import { withInstrumentsType } from '@lib/instrument';
import { withOrderNewType } from '@lib/order';
import { whenOrderbookDepthType, whenOrderbookTickerType } from '@lib/orderbook';
import { whenTradeType } from '@lib/trade';
import { Asset, d, InferObservableType } from '@quantform/core';

import { SimulatorBalance } from './simulator-balance';
import { SimulatorInstrument } from './simulator-instrument';
import { useSimulatorOptions } from './use-simulator-options';

export type WhenEvent<T extends (...args: any) => ReturnType<T>, K extends string> = {
  type: K;
  args: Parameters<T>;
  payload: InferObservableType<ReturnType<T>>;
  correlationId?: string;
};

export type WithEventCommand<
  T extends (...args: any) => Observable<ReturnType<T>>,
  K extends string
> = {
  type: `${K}-command`;
  args: Parameters<T>;
  correlationId: string;
};

export type WithEventResponse<
  T extends (...args: any) => Observable<ReturnType<T>>,
  K extends string
> = {
  type: `${K}-response`;
  payload: InferObservableType<ReturnType<T>>;
  correlationId: string;
};

export type WithEvent<T extends (...args: any) => Observable<any>, K extends string> =
  | WithEventCommand<T, K>
  | WithEventResponse<T, K>;

export type SimulatorWithEvent =
  | WithEvent<withBalancesType, 'with-balances'>
  | WithEvent<withOrderNewType, 'with-order-new'>
  | WithEvent<withInstrumentsType, 'with-instruments'>;

export type SimulatorWhenEvent =
  | WhenEvent<whenOrderbookDepthType, 'when-orderbook-depth'>
  | WhenEvent<whenOrderbookTickerType, 'when-orderbook-ticker'>
  | WhenEvent<whenTradeType, 'when-trade'>;

export type SimulatorEvent = SimulatorWithEvent | SimulatorWhenEvent;

export interface Simulator {
  apply(event: SimulatorEvent): void;
}

export class BinanceSimulator implements Simulator {
  private readonly balances: Record<string, SimulatorBalance> = {};
  private readonly instruments: Record<string, SimulatorInstrument> = {};

  private timestamp = 0;
  private events: SimulatorEvent[] = [];

  constructor(private readonly options: ReturnType<typeof useSimulatorOptions>) {
    Object.keys(options.balance).forEach(it => {
      this.balances[it] = new SimulatorBalance(
        this,
        new Asset(it, 'binance', 8),
        options.balance[it].free
      );
    });
  }

  // eslint-disable-next-line complexity
  apply(event: SimulatorEvent) {
    this.events.push(event);

    switch (event.type) {
      case 'with-instruments-response':
        event.payload.forEach(it => {
          if (!this.balances[it.base.id]) {
            this.balances[it.base.id] = new SimulatorBalance(
              this,
              new Asset(it.base.id, 'binance', 8),
              d.Zero
            );
          }

          if (!this.balances[it.quote.id]) {
            this.balances[it.quote.id] = new SimulatorBalance(
              this,
              new Asset(it.quote.id, 'binance', 8),
              d.Zero
            );
          }

          this.instruments[it.id] = new SimulatorInstrument(this, it, {
            base: this.balances[it.base.id],
            quote: this.balances[it.quote.id]
          });
        });
        break;
      case 'with-balances-command':
        this.apply({
          type: 'with-balances-response',
          correlationId: event.correlationId,
          payload: Object.values(this.balances).map(it => it.snapshot())
        });
        break;
      case 'with-balances-response':
        break;
      case 'when-orderbook-depth':
      case 'when-orderbook-ticker':
      case 'when-trade':
        this.timestamp = event.payload.timestamp;
        this.instruments[event.payload.instrument.id].apply(event);
        break;
      case 'with-order-new-command':
        const [order] = event.args;
        const response = this.instruments[order.instrument.id].with(
          event,
          this.timestamp
        );
        if (response !== undefined) {
          this.apply(response);
        }
        break;
      case 'with-order-new-response':
        break;
    }
  }

  snapshot() {
    return {
      timestamp: this.timestamp,
      balances: Object.values(this.balances).map(it => it.snapshot()),
      instruments: Object.values(this.instruments).map(it => it.snapshot())
    };
  }

  flush() {
    return this.events.splice(0, this.events.length);
  }
}
