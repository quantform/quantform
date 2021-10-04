import { Set } from 'typescript-collections';
import Binance = require('node-binance-api');
import {
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperSpotModel,
  handler,
  AdapterAwakeCommand,
  AdapterAccountCommand,
  AdapterSubscribeCommand,
  AdapterOrderOpenCommand,
  AdapterOrderCancelCommand,
  AdapterHistoryQuery,
  AdapterFeedCommand,
  AdapterContext,
  StoreEvent
} from '@quantform/core';
import { BinanceAwakeHandler } from './handlers/binance-awake.handler';
import { BinanceSubscribeHandler } from './handlers/binance-subscribe.handler';
import { BinanceHistoryHandler } from './handlers/binance-history.handler';
import { BinanceOrderCancelHandler } from './handlers/binance-order-cancel.handler';
import { BinanceOrderOpenHandler } from './handlers/binance-order-open.handler';
import { BinanceFeedHandler } from './handlers/binance-feed.handler';
import { BinanceAccountHandler } from './handlers/binance-account.handler';

export class BinanceAdapter extends Adapter {
  readonly name = 'binance';
  readonly endpoint: Binance;

  subscription = new Set<InstrumentSelector>();
  queuedOrderCompletionEvents: StoreEvent[] = [];

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.BINANCE_APISECRET
    });
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperSpotModel(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return BinanceAwakeHandler(command, context, this);
  }

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAwakeCommand, context: AdapterContext) {
    return BinanceAccountHandler(command, context, this);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return BinanceSubscribeHandler(command, context, this);
  }

  @handler(AdapterOrderOpenCommand)
  onOrderOpen(command: AdapterOrderOpenCommand, context: AdapterContext) {
    return BinanceOrderOpenHandler(command, context, this);
  }

  @handler(AdapterOrderCancelCommand)
  onOrderCancel(command: AdapterOrderCancelCommand, context: AdapterContext) {
    return BinanceOrderCancelHandler(command, context, this);
  }

  @handler(AdapterHistoryQuery)
  onHistory(query: AdapterHistoryQuery, context: AdapterContext) {
    return BinanceHistoryHandler(query, context, this);
  }

  @handler(AdapterFeedCommand)
  onFeed(command: AdapterFeedCommand, context: AdapterContext) {
    return BinanceFeedHandler(command, context, this);
  }
}
