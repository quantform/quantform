import {
  AdapterContext,
  AssetSelector,
  InstrumentSelector,
  Order,
  retry,
  Timeframe
} from '@quantform/core';

import { BinanceAdapter } from './binance.adapter';

export function instrumentToBinance(instrument: InstrumentSelector): string {
  return `${instrument.base.name.toUpperCase()}${instrument.quote.name.toUpperCase()}`;
}

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

export async function fetchBinanceBalance(
  binance: BinanceAdapter
): Promise<{ asset: AssetSelector; free: number; locked: number }[]> {
  const account = await retry<any>(() => binance.endpoint.account());

  return (account.balances as any[])
    .map(balance => {
      const free = parseFloat(balance.free);
      const locked = parseFloat(balance.locked);

      if (free <= 0 && locked <= 0) {
        return undefined;
      }

      return {
        asset: new AssetSelector(balance.asset.toLowerCase(), binance.name),
        free,
        locked
      };
    })
    .filter(it => it != undefined);
}

export async function fetchBinanceOpenOrders(
  binance: BinanceAdapter,
  context: AdapterContext
): Promise<Order[]> {
  const pendingOrders = await retry<any>(() => binance.endpoint.openOrders());

  return pendingOrders.map(it => {
    const instrument = Object.values(context.snapshot.universe.instrument).find(
      instr =>
        instr.base.adapter == binance.name &&
        it.symbol == `${instr.base.name.toUpperCase()}${instr.quote.name.toUpperCase()}`
    );

    const order = new Order(
      instrument,
      it.side,
      it.type,
      parseFloat(it.origQty),
      parseFloat(it.price)
    );

    order.id = it.clientOrderId;
    order.externalId = `${it.orderId}`;
    order.state = 'PENDING';
    order.createdAt = it.time;

    return order;
  });
}

export async function openBinanceOrder(order: Order, binance: BinanceAdapter) {
  const binanceInstrument = instrumentToBinance(order.instrument);
  const instrument =
    binance.context.snapshot.universe.instrument[order.instrument.toString()];

  switch (order.type) {
    case 'MARKET':
      switch (order.side) {
        case 'BUY':
          return await binance.endpoint.marketBuy(binanceInstrument, order.quantity, {
            newClientOrderId: order.id
          });
        case 'SELL':
          return await binance.endpoint.marketSell(binanceInstrument, order.quantity, {
            newClientOrderId: order.id
          });
      }
    case 'LIMIT':
      switch (order.side) {
        case 'BUY':
          return await binance.endpoint.buy(
            binanceInstrument,
            order.quantity,
            order.rate.toFixed(instrument.quote.scale),
            {
              newClientOrderId: order.id
            }
          );
        case 'SELL':
          return await binance.endpoint.sell(
            binanceInstrument,
            order.quantity,
            order.rate.toFixed(instrument.quote.scale),
            {
              newClientOrderId: order.id
            }
          );
      }
    default:
      throw new Error('order type not supported.');
  }
}
