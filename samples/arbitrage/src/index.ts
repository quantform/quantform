import { binance } from '@quantform/binance';
import {
  assetOf,
  beforeAll,
  candle,
  candleCompleted,
  d,
  deposit,
  instrumentOf,
  period,
  rule,
  Timeframe
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { sma } from '@quantform/stl';
import { study } from '@quantform/studio';
import { map, take, tap, withLatestFrom } from 'rxjs';

study('arbitrage', 4000, layout => {
  const instrument = instrumentOf('binance:btc-busd');

  rule('measure a btc-busd one minute candled', session => {
    const [, measure] = session.measure(
      layout.linear(it => ({ value: it.sma }), { scale: 8, pane: 0 })
    );

    const [, x] = session.measure(layout.candlestick(it => it, { scale: 8, pane: 0 }));

    return session.trade(instrument).pipe(
      candle(Timeframe.M1, it => it.rate),
      tap(it => x(it)),
      candleCompleted(),
      sma(33, it => it.close),
      tap(([, sma]) => measure({ sma }))
    );
  });

  rule('calculate account equity', session => {
    const [, equity] = session.measure(
      layout.area(it => ({ value: it.close }), { scale: 8, pane: 1 })
    );

    return session
      .trade(instrument)
      .pipe(
        withLatestFrom(
          session.balance(instrument.base),
          session.balance(instrument.quote)
        )
      )
      .pipe(
        map(([trade, base, quote]) => ({
          timestamp: trade.timestamp,
          value: quote.total.plus(base.total.mul(trade.rate))
        })),
        candle(Timeframe.M1, it => it.value),
        candleCompleted(),
        tap(equity)
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
    period(new Date('2022-06-01'), new Date('2022-10-01')),
    deposit(instrument.base, d(10)),
    deposit(instrument.quote, d(3000))
  ];
});
