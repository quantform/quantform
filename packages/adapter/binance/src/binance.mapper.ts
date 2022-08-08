import {
  Asset,
  AssetSelector,
  BalancePatchEvent,
  Candle,
  Commission,
  commissionPercentOf,
  decimal,
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
  const free = new decimal(response.free);
  const locked = new decimal(response.locked);

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

  const quantity = new decimal(response.origQty);

  const order = new Order(
    instrument,
    response.type,
    response.side == 'BUY' ? quantity : quantity.mul(-1),
    new decimal(response.price)
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
        scale.quote = new decimal(filter.tickSize).decimalPlaces();
        break;

      case 'LOT_SIZE':
        scale.base = new decimal(filter.stepSize).decimalPlaces();
        break;
    }
  }

  const base = new Asset(response.baseAsset, BINANCE_ADAPTER_NAME, scale.base);
  const quote = new Asset(response.quoteAsset, BINANCE_ADAPTER_NAME, scale.quote);

  return new InstrumentPatchEvent(
    timestamp,
    base,
    quote,
    commissionPercentOf({ maker: new decimal(0.1), taker: new decimal(0.1) }),
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
    new decimal(message.p),
    new decimal(message.q),
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
    new decimal(message.bestAsk),
    new decimal(message.bestAskQty),
    new decimal(message.bestBid),
    new decimal(message.bestBidQty),
    timestamp
  );
}

export function binanceOutboundAccountPositionToBalancePatchEvent(
  message: any,
  timestamp: number
) {
  return new BalancePatchEvent(
    new AssetSelector(message.a.toLowerCase(), BINANCE_ADAPTER_NAME),
    new decimal(message.f),
    new decimal(message.l),
    timestamp
  );
}

// eslint-disable-next-line complexity
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
    const quantity = new decimal(message.q);

    const newOrder = new Order(
      instrument,
      message.o,
      message.S == 'BUY' ? quantity : quantity.mul(-1),
      new decimal(message.p)
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
      ? new decimal(message.p)
      : new decimal(message.Z).div(new decimal(message.z));

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
    new decimal(response[1]),
    new decimal(response[2]),
    new decimal(response[3]),
    new decimal(response[4]),
    new decimal(response[5])
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    new decimal(response.makerCommission).div(100),
    new decimal(response.takerCommission).div(100)
  );
}
