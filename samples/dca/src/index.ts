import { binance } from '@quantform/binance';
import {
  beforeAll,
  d,
  deposit,
  instrumentOf,
  ohlc,
  ohlcCompleted,
  period,
  rule,
  Timeframe
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { sma } from '@quantform/stl';
import { study } from '@quantform/studio';
import { forkJoin, map, take, tap, withLatestFrom } from 'rxjs';

study('dca', 4000, layout => {
  const timeframe = Timeframe.H1;
  const instrument = instrumentOf('binance:btc-busd');

  rule('measure a btc-busd one minute candled', session => {
    const [, measure] = session.measure(
      layout.linear(it => ({ value: it.sma }), { scale: 8, pane: 0 })
    );

    const [, x] = session.measure(
      layout.candlestick(it => it, { scale: 8, pane: 0, downColor: '#444444' })
    );

    return session.trade(instrument).pipe(
      ohlc(timeframe, it => it.rate),
      tap(it => x(it)),
      ohlcCompleted(),
      sma(33, it => it.close),
      tap(([, sma]) => measure({ sma }))
    );
  });

  rule('calculate account equity', session => {
    const [, base] = session.measure(
      layout.area(it => ({ value: it.close }), {
        scale: 8,
        pane: 1,
        lineColor: '#FFDF00',
        topColor: '#FFDF0011'
      })
    );

    const [, quote] = session.measure(
      layout.area(it => ({ value: it.close }), { scale: 8, pane: 1 })
    );

    return forkJoin([
      session.trade(instrument).pipe(
        withLatestFrom(session.balance(instrument.base)),
        map(([trade, base]) => ({
          timestamp: trade.timestamp,
          value: base.total.mul(trade.rate)
        })),
        ohlc(timeframe, it => it.value),
        tap(base)
      ),
      session.trade(instrument).pipe(
        withLatestFrom(session.balance(instrument.quote)),
        map(([trade, quote]) => ({
          timestamp: trade.timestamp,
          value: quote.total
        })),
        ohlc(timeframe, it => it.value),
        tap(quote)
      )
    ]);
  });

  beforeAll(session =>
    session.orders(instrument).pipe(
      take(1),
      tap(it => console.log(`${it.length}`))
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
