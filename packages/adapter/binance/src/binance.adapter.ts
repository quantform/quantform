import {
  Adapter,
  AdapterFactory,
  AdapterTimeProvider,
  BalanceLockOrderEvent,
  BalanceUnlockOrderEvent,
  Cache,
  Candle,
  FeedAsyncCallback,
  InstrumentPatchEvent,
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
  PaperEngine,
  Store,
  StoreEvent,
  tf,
  Timeframe,
  timestamp,
  TradePatchEvent
} from '@quantform/core';

import { BinanceConnector } from './binance.connector';
import {
  binanceExecutionReportToEvents,
  binanceOutboundAccountPositionToBalancePatchEvent,
  binanceToBalancePatchEvent,
  binanceToCandle,
  binanceToCommission,
  binanceToInstrumentPatchEvent,
  binanceToOrderbookPatchEvent,
  binanceToOrderLoadEvent,
  binanceToTradePatchEvent,
  timeframeToBinance
} from './binance.mapper';

export const BINANCE_ADAPTER_NAME = 'binance';

export function binanceCacheKey(key: string) {
  return {
    key: `${BINANCE_ADAPTER_NAME}:${key}`
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

  createPaperEngine(adapter: PaperAdapter) {
    return new PaperEngine(adapter.store);
  }

  async awake(): Promise<void> {
    await this.connector.useServerTime();

    const response = await this.cache.tryGet(
      () => this.connector.getExchangeInfo(),
      binanceCacheKey('exchange-info')
    );

    this.store.dispatch(
      ...response.symbols.map(it => binanceToInstrumentPatchEvent(it, this.timestamp()))
    );
  }

  dispose(): Promise<void> {
    return this.connector.unsubscribe();
  }

  async account(): Promise<void> {
    const account = await this.connector.account();
    const orders = await this.connector.openOrders();

    const timestamp = this.timestamp();
    const commission = binanceToCommission(account);

    this.store.dispatch(
      ...this.store.snapshot.universe.instrument
        .asReadonlyArray()
        .map(
          it => new InstrumentPatchEvent(timestamp, it.base, it.quote, commission, it.id)
        ),
      ...account.balances.map(it => binanceToBalancePatchEvent(it, timestamp)),
      ...orders.map(it => binanceToOrderLoadEvent(it, this.store.snapshot, timestamp))
    );

    await this.connector.userData(
      (message: any) =>
        this.store.dispatch(
          ...binanceExecutionReportToEvents(
            message,
            this.store.snapshot,
            this.queuedOrderCompletionEvents,
            this.timestamp()
          )
        ),
      (message: any) =>
        this.store.dispatch(
          ...message.B?.map(it =>
            binanceOutboundAccountPositionToBalancePatchEvent(it, this.timestamp())
          ),
          ...this.queuedOrderCompletionEvents.splice(
            0,
            this.queuedOrderCompletionEvents.length
          )
        )
    );
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    for (const instrument of instruments.map(it =>
      this.store.snapshot.universe.instrument.get(it.id)
    )) {
      if (this.store.snapshot.subscription.instrument.get(instrument.id)) {
        continue;
      }

      this.store.dispatch(
        new InstrumentSubscriptionEvent(this.timestamp(), instrument, true)
      );

      await this.connector.trades(instrument.raw, message =>
        this.store.dispatch(
          binanceToTradePatchEvent(message, instrument, this.timestamp())
        )
      );

      await this.connector.bookTickers(instrument.raw, message =>
        this.store.dispatch(
          binanceToOrderbookPatchEvent(message, instrument, this.timestamp())
        )
      );
    }
  }

  async open(order: Order): Promise<void> {
    this.store.dispatch(
      new OrderNewEvent(order, this.timestamp()),
      new BalanceLockOrderEvent(order.id, order.instrument, this.timestamp())
    );

    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);

    try {
      const response = await this.connector.open({
        ...order,
        symbol: instrument.raw,
        scale: instrument.quote.scale
      });

      if (!order.externalId) {
        order.externalId = `${response.orderId}`;
      }

      if (response.status == 'NEW' && order.state != 'PENDING') {
        this.store.dispatch(
          new OrderPendingEvent(order.id, order.instrument, this.timestamp())
        );
      }
    } catch (e) {
      this.store.dispatch(
        new BalanceUnlockOrderEvent(order.id, order.instrument, this.timestamp()),
        new OrderRejectedEvent(order.id, order.instrument, this.timestamp())
      );
    }
  }

  async cancel(order: Order): Promise<void> {
    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);

    this.store.dispatch(new OrderCancelingEvent(order.id, instrument, this.timestamp()));

    try {
      await this.connector.cancel({
        symbol: instrument.raw,
        externalId: order.externalId
      });

      this.store.dispatch(new OrderCanceledEvent(order.id, instrument, this.timestamp()));
    } catch (e) {
      this.store.dispatch(
        new OrderCancelFailedEvent(order.id, instrument, this.timestamp())
      );
    }
  }

  async history(
    selector: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    const instrument = this.store.snapshot.universe.instrument.get(selector.id);

    const response = await this.connector.candlesticks(
      instrument.raw,
      timeframeToBinance(timeframe),
      {
        limit: length,
        endTime: tf(this.timestamp(), timeframe)
      }
    );

    return response.map(it => binanceToCandle(it));
  }

  async feed(
    selector: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    const instrument = this.store.snapshot.universe.instrument.get(selector.id);
    const count = 1000;

    while (from < to) {
      const response = await this.connector.candlesticks(
        instrument.raw,
        timeframeToBinance(Timeframe.M1),
        {
          limit: count,
          startTime: from,
          endTime: to
        }
      );

      if (!response.length) {
        break;
      }

      const events = response.map(it => {
        const candle = binanceToCandle(it);

        return new TradePatchEvent(
          instrument,
          candle.close,
          candle.volume,
          candle.timestamp
        );
      });

      await callback(from, events);

      from = response[response.length - 1][0] + 1;

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
