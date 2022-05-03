import {
  Asset,
  AssetSelector,
  BalancePatchEvent,
  Candle,
  CandleEvent,
  Commission,
  commissionPercentOf,
  InnerSet,
  Instrument,
  InstrumentPatchEvent,
  InstrumentSelector,
  Order,
  OrderbookPatchEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderLoadEvent,
  OrderNewEvent,
  OrderPendingEvent,
  precision,
  State,
  StoreEvent,
  Timeframe,
  TradePatchEvent
} from '@quantform/core';

import { BINANCE_ADAPTER_NAME } from './binance.adapter';

export function timeframeToBinance(timeframe: number): string {
  switch (timeframe) {
    case Timeframe.M1:
      return '1m';
    case Timeframe.M5:
      return '5m';
    case Timeframe.M15:
      return '15m';
    case Timeframe.M30:
      return '30m';
    case Timeframe.H1:
      return '1h';
    case Timeframe.H6:
      return 'h6';
    case Timeframe.H12:
      return '12h';
    case Timeframe.D1:
      return '1d';
  }

  throw new Error(`unsupported timeframe: ${timeframe}`);
}

export function binanceToBalancePatchEvent(response: any, timestamp: number) {
  const free = parseFloat(response.free);
  const locked = parseFloat(response.locked);

  return new BalancePatchEvent(
    new AssetSelector(response.asset.toLowerCase(), BINANCE_ADAPTER_NAME),
    free,
    locked,
    timestamp
  );
}

export function binanceToOrderLoadEvent(response: any, state: State, timestamp: number) {
  const instrument = state.universe.instrument
    .asReadonlyArray()
    .find(it => it.base.adapterName == BINANCE_ADAPTER_NAME && response.symbol == it.raw);

  const quantity = parseFloat(response.origQty);

  const order = new Order(
    instrument,
    response.type,
    response.side == 'BUY' ? quantity : -quantity,
    parseFloat(response.price)
  );

  order.id = response.clientOrderId;
  order.externalId = `${response.orderId}`;
  order.state = 'PENDING';
  order.createdAt = response.time;

  return new OrderLoadEvent(order, timestamp);
}

export function binanceToInstrumentPatchEvent(
  response: any,
  timestamp: number
): InstrumentPatchEvent {
  const scale = {
    base: 8,
    quote: 8
  };

  for (const filter of response.filters) {
    switch (filter.filterType) {
      case 'PRICE_FILTER':
        scale.quote = precision(Number(filter.tickSize));
        break;

      case 'LOT_SIZE':
        scale.base = precision(Number(filter.stepSize));
        break;
    }
  }

  const base = new Asset(response.baseAsset, BINANCE_ADAPTER_NAME, scale.base);
  const quote = new Asset(response.quoteAsset, BINANCE_ADAPTER_NAME, scale.quote);

  return new InstrumentPatchEvent(
    timestamp,
    base,
    quote,
    commissionPercentOf({ maker: 0.1, taker: 0.1 }),
    response.symbol
  );
}

export function binanceToTradePatchEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new TradePatchEvent(
    instrument,
    parseFloat(message.p),
    parseFloat(message.q),
    timestamp
  );
}

export function binanceToOrderbookPatchEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchEvent(
    instrument,
    parseFloat(message.bestAsk),
    parseFloat(message.bestAskQty),
    parseFloat(message.bestBid),
    parseFloat(message.bestBidQty),
    timestamp
  );
}

export function binanceOutboundAccountPositionToBalancePatchEvent(
  message: any,
  timestamp: number
) {
  return new BalancePatchEvent(
    new AssetSelector(message.a.toLowerCase(), BINANCE_ADAPTER_NAME),
    parseFloat(message.f),
    parseFloat(message.l),
    timestamp
  );
}

export function binanceExecutionReportToEvents(
  message: any,
  state: State,
  queuedOrderCompletionEvents: StoreEvent[],
  timestamp: number
) {
  const clientOrderId = message.C?.length > 0 ? message.C : message.c;
  const instrument = state.universe.instrument
    .asReadonlyArray()
    .find(it => it.raw === message.s && it.base.adapterName === BINANCE_ADAPTER_NAME);
  const order = state.order.get(instrument.id).get(clientOrderId);

  if (!order) {
    const quantity = parseFloat(message.q);

    const newOrder = new Order(
      instrument,
      message.o,
      message.S == 'BUY' ? quantity : -quantity,
      parseFloat(message.p)
    );

    newOrder.id = clientOrderId;
    newOrder.externalId = `${message.i}`;
    newOrder.state = 'NEW';
    newOrder.createdAt = message.T;

    return [
      new OrderNewEvent(newOrder, timestamp),
      new OrderPendingEvent(newOrder.id, instrument, timestamp)
    ];
  }

  if (!order.externalId) {
    order.externalId = `${message.i}`;
  }

  const averagePrice =
    message.o == 'LIMIT'
      ? parseFloat(message.p)
      : parseFloat(message.Z) / parseFloat(message.z);

  switch (message.X) {
    case 'NEW':
    case 'PARTIALLY_FILLED':
    case 'TRADE':
      if (order.state != 'PENDING') {
        return [new OrderPendingEvent(order.id, instrument, timestamp)];
      }
      break;
    case 'FILLED':
      queuedOrderCompletionEvents.push(
        new OrderFilledEvent(order.id, instrument, averagePrice, timestamp)
      );
      break;
    case 'EXPIRED':
    case 'REJECTED':
    case 'CANCELED':
      return [
        new OrderCancelingEvent(order.id, instrument, timestamp),
        new OrderCanceledEvent(order.id, instrument, timestamp)
      ];
      break;
  }

  return [];
}

export function binanceToCandle(response: any) {
  return new Candle(
    response[0],
    parseFloat(response[1]),
    parseFloat(response[2]),
    parseFloat(response[3]),
    parseFloat(response[4])
  );
}

export function binanceToCandleEvent(response: any, instrument: Instrument) {
  return new CandleEvent(
    instrument,
    Timeframe.M1,
    parseFloat(response[1]),
    parseFloat(response[2]),
    parseFloat(response[3]),
    parseFloat(response[4]),
    0,
    response[0]
  );
}

export function binanceToCommission(response: any) {
  return new Commission(response.makerCommission / 100, response.takerCommission / 100);
}
