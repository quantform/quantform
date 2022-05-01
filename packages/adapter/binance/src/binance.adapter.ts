import {
  Adapter,
  AdapterFactory,
  AdapterTimeProvider,
  Cache,
  Candle,
  FeedQuery,
  HistoryQuery,
  InstrumentSelector,
  InstrumentSubscriptionEvent,
  Order,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  PaperAdapter,
  PaperSpotSimulator,
  Store,
  StoreEvent
} from '@quantform/core';

import { BinanceConnector } from './binance.connector';
import {
  binanceSymbolToInstrument,
  binanceToOrderbookPatchEvent,
  binanceToTradePatchEvent,
  instrumentToBinance
} from './binance.mapper';
import { BinanceAccountHandler } from './handlers/binance-account.handler';
import { BinanceFeedHandler } from './handlers/binance-feed.handler';
import { BinanceHistoryHandler } from './handlers/binance-history.handler';

export const BINANCE_ADAPTER_NAME = 'binance';

export function binanceCacheKey(key: string) {
  return {
    key: `binance:${key}`
  };
}

export function binance(options?: { key: string; secret: string }): AdapterFactory {
  return (timeProvider, store, cache) => {
    const connector = new BinanceConnector(
      options?.key ?? process.env.QF_BINANCE_APIKEY,
      options?.secret ?? process.env.QF_BINANCE_APISECRET
    );

    return new BinanceAdapter(connector, store, cache, timeProvider);
  };
}

export class BinanceAdapter extends Adapter {
  readonly name = BINANCE_ADAPTER_NAME;

  queuedOrderCompletionEvents: StoreEvent[] = [];

  constructor(
    private readonly connector: BinanceConnector,
    private readonly store: Store,
    private readonly cache: Cache,
    timeProvider: AdapterTimeProvider
  ) {
    super(timeProvider);
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperSpotSimulator(adapter);
  }

  async awake(): Promise<void> {
    await this.connector.useServerTime();

    const response = await this.cache.tryGet(
      () => this.connector.getExchangeInfo(),
      binanceCacheKey('exchange-info')
    );

    this.store.dispatch(
      ...response.map(it => binanceSymbolToInstrument(it.symbols, this.timestamp()))
    );
  }

  dispose(): Promise<void> {
    return this.connector.unsubscribe();
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    for (const instrument of instruments) {
      if (this.store.snapshot.subscription.instrument.get(instrument.id)) {
        continue;
      }

      this.store.dispatch(
        new InstrumentSubscriptionEvent(this.timestamp(), instrument, true)
      );

      await this.connector.trades(instrumentToBinance(instrument), message =>
        this.store.dispatch(
          binanceToTradePatchEvent(message, instrument, this.timestamp())
        )
      );

      await this.connector.bookTickers(instrumentToBinance(instrument), message =>
        this.store.dispatch(
          binanceToOrderbookPatchEvent(message, instrument, this.timestamp())
        )
      );
    }
  }

  account(): Promise<void> {
    return BinanceAccountHandler(this.context, this);
  }

  async open(order: Order): Promise<void> {
    this.store.dispatch(
      ...caluclateFreezAllocation(context, order, this.timestamp()),
      new OrderNewEvent(order, this.timestamp())
    );

    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);

    const response = await this.connector.open({
      ...order,
      symbol: instrumentToBinance(instrument),
      scale: instrument.quote.scale
    });

    if (response.msg) {
      this.store.dispatch(
        new OrderRejectedEvent(order.id, order.instrument, this.timestamp())
      );
    } else {
      if (!order.externalId) {
        order.externalId = `${response.orderId}`;
      }

      if (response.status == 'NEW' && order.state != 'PENDING') {
        this.store.dispatch(
          new OrderPendingEvent(order.id, order.instrument, this.timestamp())
        );
      }
    }
  }

  async cancel(order: Order): Promise<void> {
    this.store.dispatch(
      new OrderCancelingEvent(order.id, order.instrument, this.timestamp())
    );

    try {
      await this.connector.cancel({
        symbol: instrumentToBinance(order.instrument),
        externalId: order.externalId
      });

      this.store.dispatch(
        new OrderCanceledEvent(order.id, order.instrument, this.timestamp())
      );
    } catch (e) {
      this.store.dispatch(
        new OrderCancelFailedEvent(order.id, order.instrument, this.timestamp())
      );
    }
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return BinanceHistoryHandler(query, this.context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return BinanceFeedHandler(query, this.context, this);
  }
}
