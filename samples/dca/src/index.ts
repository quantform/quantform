import { binance } from '@quantform/binance';
import {
  d,
  deposit,
  describe,
  instrumentOf,
  ohlc,
  period,
  rule,
  Timeframe
} from '@quantform/core';
import { sma } from '@quantform/stl';
import { combineLatest, filter, map, share, take, tap } from 'rxjs';

describe('golden-cross', () => {
  const instrument = instrumentOf('binance:eth-usdt');

  rule('buy 0.1 ETH on Binance when SMA(50) crossover SMA(200) on D1 candle', session => {
    const candle$ = session.trade(instrument).pipe(
      tap(it => console.log(it)),

      ohlc(Timeframe.H1, it => it.rate),
      share()
    );

    return combineLatest([
      candle$.pipe(sma(50, it => it.close)),
      candle$.pipe(sma(200, it => it.close))
    ]).pipe(
      filter(([[, short], [, long]]) => short.greaterThan(long)),
      take(1),
      map(() => session.open({ instrument, quantity: d(0.1) }))
    );
  });

  return [binance(), deposit(instrument.quote, d(1000)), period(new Date('2022-06-01'))];
});
/*
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
*/
