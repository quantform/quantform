import { combineLatest, tap } from 'rxjs';

import { binance } from '@quantform/binance';
import { d, instrumentOf, log, rule, strategy } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { fromOrderbook } from './risk/open-order.operator';

const logger = log('hello');

export default function () {
  rule('get profit ratio', session =>
    combineLatest([
      session.orderbook(instrumentOf('binance:bts-btc')),
      session.orderbook(instrumentOf('binance:bts-usdt')),
      session.orderbook(instrumentOf('binance:btc-usdt'))
    ]).pipe(
      tap(([dogebtc, dogeusdt, btcusdt]) => {
        const quantity = d(0.5);
        const dogeQty = dogebtc.instrument.base.floor(quantity.div(dogebtc.bids.rate));
        const usdtQuantity = dogeusdt.instrument.base.floor(
          dogeQty.mul(dogeusdt.bids.rate)
        );
        const btcQuantity = usdtQuantity.div(btcusdt.asks.rate);

        logger.debug(btcQuantity.minus(quantity).mul(btcusdt.asks.rate));
      })
    )
  );

  return [binance(), sqlite()];
}
