import {
  Asset,
  AssetSelector,
  BalanceLoadEvent,
  BalancePatchEvent,
  Commission,
  commissionPercentOf,
  d,
  InstrumentPatchEvent,
  InstrumentSelector,
  Ohlc,
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

import { BINANCE_ADAPTER_NAME } from './binance-adapter';

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

export function binanceToBalanceLoadEvent(response: any, timestamp: number) {
  const free = d(response.free);
  const locked = d(response.locked);

  return new BalanceLoadEvent(
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

  if (!instrument) {
    throw new Error();
  }

  const quantity = d(response.origQty);

  const order = new Order(
    timestamp,
    response.clientOrderId,
    instrument,
    response.side == 'BUY' ? quantity : quantity.mul(-1),
    response.time,
    response.price ? d(response.price) : undefined
  );

  order.externalId = `${response.orderId}`;
  order.state = 'PENDING';

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
        scale.quote = d(filter.tickSize).decimalPlaces();
        break;

      case 'LOT_SIZE':
        scale.base = d(filter.stepSize).decimalPlaces();
        break;
    }
  }

  const base = new Asset(response.baseAsset, BINANCE_ADAPTER_NAME, scale.base);
  const quote = new Asset(response.quoteAsset, BINANCE_ADAPTER_NAME, scale.quote);

  return new InstrumentPatchEvent(
    timestamp,
    base,
    quote,
    commissionPercentOf({ maker: d(0.1), taker: d(0.1) }),
    response.symbol
  );
}

export function binanceToTradePatchEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new TradePatchEvent(instrument, d(message.p), d(message.q), timestamp);
}

export function binanceToOrderbookPatchEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchEvent(
    instrument,
    { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined },
    timestamp
  );
}

export function binanceOutboundAccountPositionToBalancePatchEvent(
  message: any,
  timestamp: number
) {
  return new BalancePatchEvent(
    new AssetSelector(message.a.toLowerCase(), BINANCE_ADAPTER_NAME),
    d(message.f),
    d(message.l),
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

  if (!instrument) {
    throw new Error();
  }

  const order = state.order.get(instrument.id)?.get(clientOrderId);

  if (!order) {
    const quantity = d(message.q);

    const newOrder = new Order(
      timestamp,
      clientOrderId,
      instrument,
      message.S == 'BUY' ? quantity : quantity.mul(-1),
      message.T,
      d(message.p)
    );

    newOrder.externalId = `${message.i}`;
    newOrder.state = 'NEW';

    return [
      new OrderNewEvent(newOrder, timestamp),
      new OrderPendingEvent(newOrder.id, instrument, timestamp)
    ];
  }

  if (!order.externalId) {
    order.externalId = `${message.i}`;
  }

  const averagePrice =
    message.o == 'LIMIT' ? d(message.p) : d(message.Z).div(d(message.z));

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
  }

  return [];
}

export function binanceToOhlc(response: any) {
  return new Ohlc(
    response[0],
    d(response[1]),
    d(response[2]),
    d(response[3]),
    d(response[4]),
    d(response[5])
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
