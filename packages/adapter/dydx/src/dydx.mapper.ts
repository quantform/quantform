import { MarketResponseObject } from '@dydxprotocol/v3-client';
import {
  Asset,
  commissionPercentOf,
  d,
  InstrumentPatchEvent,
  InstrumentSelector,
  Liquidity,
  OrderbookPatchEvent,
  PriorityList,
  Timeframe,
  TradePatchEvent
} from '@quantform/core';

import { DYDX_ADAPTER_NAME } from './dydx.adapter';

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

export function dydxToInstrumentPatchEvent(
  response: MarketResponseObject,
  timestamp: number
): InstrumentPatchEvent {
  const base = new Asset(
    response.baseAsset,
    DYDX_ADAPTER_NAME,
    d(response.stepSize).decimalPlaces()
  );

  const quote = new Asset(
    response.quoteAsset,
    DYDX_ADAPTER_NAME,
    d(response.tickSize).decimalPlaces()
  );

  return new InstrumentPatchEvent(
    timestamp,
    base,
    quote,
    commissionPercentOf({ maker: d(0.1), taker: d(0.1) }),
    response.market
  );
}

export function dydxToTradePatchEvent(message: any, instrument: InstrumentSelector) {
  const timestamp = new Date(message.createdAt).getTime();

  return new TradePatchEvent(instrument, d(message.price), d(message.size), timestamp);
}

export function dydxOrderbookPatchSnapshot(
  liquidity: PriorityList<Liquidity & { offset: number }>,
  message: any
) {
  const rate = d(message.price);
  const quantity = d(message.size);
  const offset = parseInt(message.offset);

  if (quantity.greaterThan(d.Zero)) {
    liquidity.enqueue({ rate, quantity, offset });
  } else {
    liquidity.dequeue({ rate, quantity, offset });
  }
}

export function dydxOrderbookPatchUpdate(
  liquidity: PriorityList<Liquidity & { offset: number }>,
  message: any,
  offset: number
) {
  const rate = d(message[0]);
  const quantity = d(message[1]);

  const current = liquidity.getByKey(rate);
  if (current && current.offset > offset) {
    return;
  }

  liquidity.enqueue({ rate, quantity, offset });
}

export function dydxToOrderbookPatchEvent(
  instrument: InstrumentSelector,
  asks: PriorityList<Liquidity & { offset: number }>,
  bids: PriorityList<Liquidity & { offset: number }>,
  timestamp: number
) {
  let ask = asks.head;
  let bid = bids.head;

  asks.visit(it => {
    if (it.quantity.greaterThan(0)) {
      ask = it;
      return false;
    }

    return true;
  });

  bids.visit(it => {
    if (it.quantity.greaterThan(0)) {
      bid = it;
      return false;
    }

    return true;
  });

  return new OrderbookPatchEvent(instrument, ask, bid, timestamp);
}
