import { Set } from 'typescript-collections';
import {
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperSpotSimulator,
  AdapterContext,
  StoreEvent,
  Order,
  Candle,
  HistoryQuery,
  FeedQuery
} from '@quantform/core';
import { BinanceAwakeHandler } from './handlers/binance-awake.handler';
import { BinanceSubscribeHandler } from './handlers/binance-subscribe.handler';
import { BinanceHistoryHandler } from './handlers/binance-history.handler';
import { BinanceOrderCancelHandler } from './handlers/binance-order-cancel.handler';
import { BinanceOrderOpenHandler } from './handlers/binance-order-open.handler';
import { BinanceFeedHandler } from './handlers/binance-feed.handler';
import { BinanceAccountHandler } from './handlers/binance-account.handler';
import { BinanceDisposeHandler } from './handlers/binance-dispose.handler';
const Binance = require('node-binance-api');

export class BinanceAdapter extends Adapter {
  readonly name = 'binance';
  readonly endpoint: any;

  subscription = new Set<InstrumentSelector>();
  queuedOrderCompletionEvents: StoreEvent[] = [];

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.QF_BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.QF_BINANCE_APISECRET,
      log: (...args) => {}
    });
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperSpotSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);

    await BinanceAwakeHandler(context, this);
  }

  dispose(): Promise<void> {
    return BinanceDisposeHandler(this.context, this);
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

  cancel(order: Order): Promise<void> {
    return BinanceOrderCancelHandler(order, this.context, this);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return BinanceHistoryHandler(query, this.context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return BinanceFeedHandler(query, this.context, this);
  }
}
