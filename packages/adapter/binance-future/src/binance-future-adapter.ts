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
  PaperMarginExecutor,
  AdapterAwakeCommand,
  handler,
  AdapterContext,
  AdapterAccountCommand,
  AdapterSubscribeCommand,
  AdapterOrderOpenCommand,
  AdapterHistoryQuery,
  AdapterFeedCommand,
  AdapterOrderCancelCommand
} from '@quantform/core';
const Binance = require('node-binance-api');

export class BinanceFutureAdapter extends Adapter {
  readonly name = 'binancefuture';
  readonly endpoint: any;

  subscribed = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.BINANCE_APISECRET
    });
  }

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperMarginExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return BinanceFutureAwakeHandler(command, context, this);
  }

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAccountCommand, context: AdapterContext) {
    return BinanceFutureAccountHandler(command, context, this);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return BinanceFutureSubscribeHandler(command, context, this);
  }

  @handler(AdapterOrderOpenCommand)
  onOrderOpen(command: AdapterOrderOpenCommand, context: AdapterContext) {
    return BinanceFutureOrderOpenHandler(command, context, this);
  }

  @handler(AdapterOrderCancelCommand)
  onOrderCancel(command: AdapterOrderCancelCommand, context: AdapterContext) {
    return BinanceFutureOrderCancelHandler(command, context, this);
  }

  @handler(AdapterHistoryQuery)
  onHistory(command: AdapterHistoryQuery, context: AdapterContext) {
    return BinanceFutureHistoryHandler(command, context, this);
  }

  @handler(AdapterFeedCommand)
  onFeed(command: AdapterFeedCommand, context: AdapterContext) {
    return BinanceFutureFeedHandler(command, context, this);
  }
}
