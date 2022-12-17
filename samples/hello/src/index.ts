import { combineLatest, tap } from 'rxjs';

import { binance } from '@quantform/binance';
import { d, instrumentOf, log, rule, strategy } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { fromOrderbook } from './risk/open-order.operator';

const logger = log('hello');

export default strat(() => {
  rule('get profit ratio', session =>
    combineLatest([
      fromOrderbook(instrumentOf('binance:bts-btc')),
      fromOrderbook(instrumentOf('binance:bts-usdt')),
      fromOrderbook(instrumentOf('binance:btc-usdt'))
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
});
