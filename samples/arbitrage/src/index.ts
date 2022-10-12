import { binance } from '@quantform/binance';
import {
  assetOf,
  candle,
  d,
  deposit,
  instrumentOf,
  rule,
  Timeframe
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { study } from '@quantform/studio';
import { tap } from 'rxjs';

study('arbitrage', 4000, layout => {
  rule('measure a btc-busd one minute candle', session => {
    const base = instrumentOf('binance:btc-busd');
    const [, measure] = session.measure(
      layout.candlestick({ kind: 'test', map: x => ({ ...x }), scale: 8 })
    );

    return session.trade(base).pipe(
      candle(Timeframe.M1, it => it.rate),
      tap(it => measure(it))
    );
  });

  rule('render eth-busd candles', session => {
    const quote = instrumentOf('binance:eth-busd');
    const [, measure] = session.measure(
      layout.candlestick({ kind: 'test2', map: x => ({ ...x }), scale: 8 })
    );

    return session.trade(quote).pipe(
      candle(Timeframe.M1, it => it.rate),
      tap(it => measure(it))
    );
  });

  return [binance(), sqlite(), deposit(assetOf('binance:btc'), d(10))];
});
