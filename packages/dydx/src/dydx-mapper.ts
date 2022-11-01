import { MarketResponseObject } from '@dydxprotocol/v3-client';
import {
  Asset,
  AssetSelector,
  BalancePatchEvent,
  commissionPercentOf,
  d,
  Instrument,
  InstrumentPatchEvent,
  InstrumentSelector,
  Liquidity,
  Order,
  OrderbookPatchEvent,
  OrderLoadEvent,
  PriorityList,
  TradePatchEvent
} from '@quantform/core';
import { v4 } from 'uuid';

import { DYDX_ADAPTER_NAME } from './dydx-adapter';

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
    response.market,
    20
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

  const current = liquidity.getByKey(rate.toString());
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

  if (!ask || !bid) {
    throw new Error('Orderbook error');
  }

  return new OrderbookPatchEvent(instrument, ask, bid, timestamp);
}

export function dydxToBalancePatchEvent(
  asset: AssetSelector,
  message: any,
  timestamp: number
) {
  const free = d(message.contents.account.quoteBalance);

  return new BalancePatchEvent(asset, free, d.Zero, timestamp);
}

export function dydxToOrderLoadEvent(
  message: any,
  instruments: Readonly<Instrument[]>,
  timestamp: number
) {
  if (message.type != 'LIMIT') {
    throw new Error(`Unsupported order type ${message.type}`);
  }

  const instrument = instruments.find(
    it => it.base.adapterName == DYDX_ADAPTER_NAME && it.raw == message.market
  );

  if (!instrument) {
    throw new Error('Missing instrument');
  }

  const order = new Order(
    timestamp,
    v4(),
    instrument,
    d(message.size),
    new Date(message.createdAt).getTime(),
    d(message.price)
  );

  order.quantityExecuted = d(message.size).minus(d(message.remainingSize));
  order.externalId = message.id;
  order.state = 'PENDING';

  return new OrderLoadEvent(order, timestamp);
}
