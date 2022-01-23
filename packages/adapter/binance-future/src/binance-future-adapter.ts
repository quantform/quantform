import { Set } from 'typescript-collections';
import { BinanceFutureAwakeHandler } from './handlers/binance-future-awake.handler';
import { BinanceFutureHistoryHandler } from './handlers/binance-future-history.handler';
import { BinanceFutureSubscribeHandler } from './handlers/binance-future-subscribe.handler';
import { BinanceFutureAccountHandler } from './handlers/binance-future-account.handler';
import { BinanceFutureOrderOpenHandler } from './handlers/binance-future-order-open.handler';
import { BinanceFutureOrderCancelHandler } from './handlers/binance-future-order-cancel.handler';
import { BinanceFutureFeedHandler } from './handlers/binance-future-feed.handler';
import {
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperMarginSimulator,
  AdapterContext,
  FeedQuery,
  HistoryQuery,
  Candle,
  Order
} from '@quantform/core';
const Binance = require('node-binance-api');

export class BinanceFutureAdapter extends Adapter {
  readonly name = 'binancefuture';
  readonly endpoint: any;

  subscribed = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.QF_BINANCEFUTURE_APIKEY,
      APISECRET: options?.secret ?? process.env.QF_BINANCEFUTURE_APISECRET
    });
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);

    await BinanceFutureAwakeHandler(context, this);
  }

  async dispose(): Promise<void> {}

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return BinanceFutureSubscribeHandler(instruments, this.context, this);
  }

  account(): Promise<void> {
    return BinanceFutureAccountHandler(this.context, this);
  }

  open(order: Order): Promise<void> {
    return BinanceFutureOrderOpenHandler(order, this.context, this);
  }

  cancel(order: Order): Promise<void> {
    return BinanceFutureOrderCancelHandler(order, this.context, this);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return BinanceFutureHistoryHandler(query, this.context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return BinanceFutureFeedHandler(query, this.context, this);
  }
}
