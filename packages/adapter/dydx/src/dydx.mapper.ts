import { MarketResponseObject } from '@dydxprotocol/v3-client';
import {
  Asset,
  commissionPercentOf,
  d,
  InstrumentPatchEvent,
  InstrumentSelector,
  OrderbookPatchAsksEvent,
  OrderbookPatchBidsEvent,
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

export function dydxToOrderbookSnapshotAsksEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchAsksEvent(
    instrument,
    d(message.price),
    d(message.size),
    timestamp
  );
}

export function dydxToOrderbookSnapshotBidsEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchBidsEvent(
    instrument,
    d(message.price),
    d(message.size),
    timestamp
  );
}

export function dydxToOrderbookPatchAsksEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchAsksEvent(instrument, d(message[0]), d(message[1]), timestamp);
}

export function dydxToOrderbookPatchBidsEvent(
  message: any,
  instrument: InstrumentSelector,
  timestamp: number
) {
  return new OrderbookPatchBidsEvent(instrument, d(message[0]), d(message[1]), timestamp);
}
