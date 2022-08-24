import {
  Adapter,
  AdapterFactory,
  AdapterTimeProvider,
  Cache,
  Candle,
  FeedAsyncCallback,
  InstrumentSelector,
  InstrumentSubscriptionEvent,
  Liquidity,
  LiquidityAskComparer,
  LiquidityBidComparer,
  Order,
  PaperAdapter,
  PaperEngine,
  PriorityList,
  Store,
  timestamp
} from '@quantform/core';

import { DyDxConnector } from './dydx.connector';
import {
  dydxOrderbookPatchSnapshot,
  dydxOrderbookPatchUpdate,
  dydxToInstrumentPatchEvent,
  dydxToOrderbookPatchEvent,
  dydxToTradePatchEvent
} from './dydx.mapper';

export const DYDX_ADAPTER_NAME = 'dydx';

export function dydxCacheKey(key: string) {
  return {
    key: `${DYDX_ADAPTER_NAME}:${key}`
  };
}

export const DyDxOptions = {
  Mainnet: {
    http: 'https://api.dydx.exchange',
    ws: 'wss://api.dydx.exchange/v3/ws',
    networkId: 1
  },
  Ropsten: {
    http: 'https://api.stage.dydx.exchange',
    ws: 'wss://api.stage.dydx.exchange/v3/ws',
    networkId: 3
  }
};

export function dydx(options?: {
  http: string;
  ws: string;
  networkId: number;
}): AdapterFactory {
  return (timeProvider, store, cache) => {
    const connector = new DyDxConnector(options ?? DyDxOptions.Mainnet);

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
    this.connector.dispose();
  }

  async account(): Promise<void> {
    await this.connector.onboard();

    const { account } = await this.connector.getAccount();

    console.log(account.openPositions);
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    for (const instrument of instruments.map(it =>
      this.store.snapshot.universe.instrument.get(it.id)
    )) {
      this.store.dispatch(
        new InstrumentSubscriptionEvent(this.timestamp(), instrument, true)
      );

      this.connector.trades(instrument.raw, message => {
        if (message.type != 'subscribed') {
          message.contents.trades.forEach(it =>
            this.store.dispatch(dydxToTradePatchEvent(it, instrument))
          );
        }
      });

      const asks = new PriorityList<Liquidity & { offset: number }>(
        LiquidityAskComparer,
        'rate'
      );
      const bids = new PriorityList<Liquidity & { offset: number }>(
        LiquidityBidComparer,
        'rate'
      );

      this.connector.orderbook(instrument.raw, message => {
        const timestamp = this.timestamp();
        const { contents } = message;

        if (message.type == 'subscribed') {
          asks.clear();
          bids.clear();

          contents.asks.forEach(it => dydxOrderbookPatchSnapshot(asks, it));
          contents.bids.forEach(it => dydxOrderbookPatchSnapshot(bids, it));
        } else {
          const offset = parseInt(contents.offset);

          contents.asks.forEach(it => dydxOrderbookPatchUpdate(asks, it, offset));
          contents.bids.forEach(it => dydxOrderbookPatchUpdate(bids, it, offset));
        }

        this.store.dispatch(dydxToOrderbookPatchEvent(instrument, asks, bids, timestamp));
      });
    }
  }

  async open(order: Order): Promise<void> {
    throw new Error('not implemented');
  }

  async cancel(order: Order): Promise<void> {
    throw new Error('not implemented');
  }

  async history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    throw new Error('not implemented');
  }

  async feed(
    selector: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    const instrument = this.store.snapshot.universe.instrument.get(selector.id);

    let curr = to;

    while (curr > from) {
      const { trades } = await this.connector.getTrades(instrument.raw, curr);
      if (!trades.length) {
        break;
      }

      const events = trades.map(it => dydxToTradePatchEvent(it, selector)).reverse();
      const filtered = events.filter(it => it.timestamp >= from);

      await callback(from + Math.abs(curr - to), filtered);

      if (filtered.length != events.length) {
        break;
      }

      curr = events[0].timestamp - 1;

      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}
