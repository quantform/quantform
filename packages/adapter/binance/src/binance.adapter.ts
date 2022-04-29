import {
  Adapter,
  AdapterContext,
  Candle,
  FeedQuery,
  HistoryQuery,
  InstrumentSelector,
  Order,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  PaperAdapter,
  PaperSpotSimulator,
  StoreEvent
} from '@quantform/core';
import { Set } from 'typescript-collections';

import { BinanceConnector } from './binance.connector';
import {
  BINANCE_ADAPTER_NAME,
  binanceSymbolToInstrument,
  instrumentToBinance
} from './binance.mapper';
import { BinanceAccountHandler } from './handlers/binance-account.handler';
import { BinanceFeedHandler } from './handlers/binance-feed.handler';
import { BinanceHistoryHandler } from './handlers/binance-history.handler';
import { BinanceOrderOpenHandler } from './handlers/binance-order-open.handler';
import { BinanceSubscribeHandler } from './handlers/binance-subscribe.handler';

export class BinanceFactory {
  constructor(readonly options?: { key: string; secret: string }) {}

  create() {
    const connector = new BinanceConnector(
      this.options?.key ?? process.env.QF_BINANCE_APIKEY,
      this.options?.secret ?? process.env.QF_BINANCE_APISECRET
    );

    return new BinanceAdapter(connector);
  }
}

export class BinanceAdapter extends Adapter {
  readonly name = BINANCE_ADAPTER_NAME;

  subscription = new Set<InstrumentSelector>();
  queuedOrderCompletionEvents: StoreEvent[] = [];

  constructor(private readonly connector: BinanceConnector) {
    super();
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperSpotSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await this.connector.useServerTime();

    const response = await this.connector.fetchInstruments(context);

    context.dispatch(
      ...response.map(it => binanceSymbolToInstrument(it, context.timestamp))
    );
  }

  dispose(): Promise<void> {
    return this.connector.unsubscribe();
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return BinanceSubscribeHandler(instruments, this.context, this);
  }

  account(): Promise<void> {
    return BinanceAccountHandler(this.context, this);
  }

  open(order: Order): Promise<void> {
    return BinanceOrderOpenHandler(order, this.context, this);
  }

  async cancel(order: Order): Promise<void> {
    this.context.dispatch(new OrderCancelingEvent(order.id, this.context.timestamp));

    try {
      await this.connector.cancel({
        symbol: instrumentToBinance(order.instrument),
        externalId: order.externalId
      });

      this.context.dispatch(new OrderCanceledEvent(order.id, this.context.timestamp));
    } catch (e) {
      this.context.dispatch(new OrderCancelFailedEvent(order.id, this.context.timestamp));
    }
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return BinanceHistoryHandler(query, this.context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return BinanceFeedHandler(query, this.context, this);
  }
}
