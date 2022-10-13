import { binance } from '@quantform/binance';
import {
  assetOf,
  beforeAll,
  candle,
  d,
  deposit,
  instrumentOf,
  period,
  rule,
  Timeframe
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { study } from '@quantform/studio';
import { take, tap } from 'rxjs';

study('arbitrage', 4000, layout => {
  rule('measure a btc-busd one minute candle', session => {
    const [, measure] = session.measure(
      layout.candlestick(it => it, { scale: 8, pane: 0 })
    );

    return session.trade(instrumentOf('binance:btc-busd')).pipe(
      candle(Timeframe.M1, it => it.rate),
      tap(it => measure(it))
    );
  });

  rule('render eth-busd candles', session => {
    const [, measure] = session.measure(
      layout.histogram(it => ({ value: it.high }), { scale: 8, pane: 1 })
    );

    return session.trade(instrumentOf('binance:btc-usdt')).pipe(
      candle(Timeframe.M1, it => it.rate),
      tap(it => measure(it))
    );
  });

  beforeAll(session =>
    session.balance(assetOf('binance:btc')).pipe(
      take(1),
      tap(it => console.log(`${it.toString()}: ${it.free}`))
    )
  );

  return [
    binance(),
    sqlite(),
    period(new Date('2022-01-01'), new Date('2022-02-01')),
    deposit(assetOf('binance:btc'), d(10)),
    deposit(assetOf('binance:busd'), d(3000))
  ];
});
