import {
  Adapter,
  AdapterFactory,
  AdapterTimeProvider,
  Cache,
  Candle,
  FeedAsyncCallback,
  InstrumentSelector,
  Order,
  PaperAdapter,
  PaperEngine,
  Store,
  timestamp
} from '@quantform/core';

import { DyDxConnector } from './dydx.connector';
import { dydxToInstrumentPatchEvent, dydxToTradePatchEvent } from './dydx.mapper';

export const DYDX_ADAPTER_NAME = 'dydx';

export function dydxCacheKey(key: string) {
  return {
    key: `${DYDX_ADAPTER_NAME}:${key}`
  };
}

export function dydx(options?: { host: { http: string; ws: string } }): AdapterFactory {
  return (timeProvider, store, cache) => {
    const connector = new DyDxConnector(options?.host);

    return new DyDxAdapter(connector, store, cache, timeProvider);
  };
}

export class DyDxAdapter extends Adapter {
  readonly name = DYDX_ADAPTER_NAME;

  constructor(
    private readonly connector: DyDxConnector,
    private readonly store: Store,
    private readonly cache: Cache,
    timeProvider: AdapterTimeProvider
  ) {
    super(timeProvider);
  }

  createPaperEngine(adapter: PaperAdapter) {
    return new PaperEngine(adapter.store);
  }

  async awake(): Promise<void> {
    const { markets } = await this.cache.tryGet(
      () => this.connector.getMarkets(),
      dydxCacheKey('get-markets')
    );

    this.store.dispatch(
      ...Object.values(markets).map(it =>
        dydxToInstrumentPatchEvent(it, this.timestamp())
      )
    );
  }

  async dispose(): Promise<void> {
    console.log('dispose');
  }

  async account(): Promise<void> {
    console.log('account');
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    console.log('subscribe');
  }

  async open(order: Order): Promise<void> {
    console.log('open');
  }

  async cancel(order: Order): Promise<void> {
    console.log('cancel');
  }

  async history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    console.log('history');

    return [];
  }

  async feed(
    selector: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    const instrument = this.store.snapshot.universe.instrument.get(selector.id);

    while (to > from) {
      const { trades } = await this.connector.getTrades(instrument.raw, to);
      if (!trades.length) {
        break;
      }

      const events = trades.map(it => dydxToTradePatchEvent(it, selector)).reverse();
      const filtered = events.filter(it => it.timestamp >= from);

      await callback(0, filtered);

      if (filtered.length != events.length) {
        break;
      }

      to = events[0].timestamp - 1;
    }
  }
}
