import { binance, BinanceAdapter } from '@quantform/binance';
import {
  atr,
  Candle,
  candle,
  candleCompleted,
  ceil,
  crossover,
  crossunder,
  floor,
  instrumentOf,
  mergeCandle,
  Order,
  Position,
  rma,
  Session,
  Timeframe,
  window
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import {
  area,
  bar,
  candlestick,
  histogram,
  layout,
  linear,
  marker,
  pane,
  study,
  StudySession
} from '@quantform/studio';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  forkJoin,
  interval,
  map,
  Observable,
  share,
  switchMap,
  take,
  tap,
  throttle,
  withLatestFrom
} from 'rxjs';

export const descriptor = {
  adapter: [binance()],
  storage: sqlite(),
  simulation: {
    balance: {
      'binance:btc': 0,
      'binance:usdt': 1000
    },
    from: Date.parse('2022-01-10'),
    to: Date.parse('2022-06-01')
  },
  ...layout({
    backgroundBottomColor: '#111',
    backgroundTopColor: '#000',
    borderColor: '#3f3f46',
    gridColor: '#222',
    textColor: '#fff',
    upColor: '#74fba8',
    downColor: '#e9334b',
    children: [
      pane({
        children: [
          candlestick({
            key: 'candle',
            scale: 5,
            kind: 'candle',
            map: m => m,
            borderVisible: false,
            upColor: '#74fba8',
            downColor: '#e9334b'
          }),
          linear({
            key: 'candle-lower',
            scale: 5,
            kind: 'candle',
            map: m => ({ value: m.lower }),
            color: '#0ff',
            lineWidth: 1,
            markers: [
              marker({
                kind: 'long',
                position: 'belowBar',
                shape: 'arrowUp',
                color: '#0f0',
                text: () => 'up'
              })
            ]
          }),
          linear({
            key: 'candle-upper',
            scale: 5,
            kind: 'candle',
            map: m => ({ value: m.upper }),
            color: '#f00',
            lineWidth: 1,
            markers: [
              marker({
                kind: 'short',
                position: 'aboveBar',
                shape: 'arrowDown',
                color: '#f00',
                text: () => 'down'
              })
            ]
          })
        ]
      }),
      pane({
        children: [
          area({
            key: 'equity-benchmark',
            kind: 'equity',
            topColor: '#FFFF00',
            scale: 2,
            lineWidth: 1,
            lastValueVisible: false,
            priceLineVisible: false,
            map: m => ({
              value: m.benchmark
            })
          }),
          area({
            key: 'equity-performance',
            kind: 'equity',
            scale: 2,
            lineWidth: 1,
            lineColor: '#00ffff',
            topColor: '#00ffff',
            bottomColor: '#00ffff00',
            map: m => ({
              value: m.performance
            })
          })
        ]
      })
    ]
  })
};

export default study(3000, (session: StudySession) => {
  const [, setCandle] = session.useMeasure({ kind: 'candle' });
  const [l$, setLong] = session.useMeasure<{ timestamp: number; rate: number }>({
    kind: 'long'
  });

  const [, setShort] = session.useMeasure<{ timestamp: number; rate: number }>({
    kind: 'short'
  });
  const [, setEquity] = session.useMeasure<{
    timestamp: number;
    benchmark: number;
    performance: number;
  }>({
    kind: 'equity'
  });
  const instrument = instrumentOf('binance:btc-usdt');
  const timeframe = Timeframe.H1;

  const candle$ = session.trade(instrument).pipe(
    mergeCandle(timeframe, it => it.rate, session.history(instrument, timeframe, 30)),
    share()
  );

  const performance$ = combineLatest([
    candle$.pipe(candleCompleted()),
    session.balance(instrument.base),
    session.balance(instrument.quote)
  ]).pipe(
    map(([trade, base, quote]) => base.total * trade.close + quote.total),
    distinctUntilChanged()
  );

  const benchmark$ = combineLatest([
    candle$.pipe(candleCompleted()),
    candle$.pipe(candleCompleted()).pipe(
      take(1),
      map(it => it.close)
    ),
    session.balance(instrument.base).pipe(
      take(1),
      map(it => it.total)
    ),
    session.balance(instrument.quote).pipe(
      take(1),
      map(it => it.total)
    )
  ]).pipe(
    map(
      ([trade, firstTrade, base, quote]) =>
        base * trade.close + (quote / firstTrade) * trade.close
    ),
    distinctUntilChanged()
  );

  const equity$ = combineLatest([performance$, benchmark$]).pipe(
    map(([performance, benchmark]) => setEquity({ benchmark, performance }))
  );

  const hurst$ = candle$.pipe(
    candleCompleted(),
    tap(candle => setCandle({ ...candle })),
    hurst({ length: 30, multiplier: 3.4 }),
    tap(([candle, hurst]) => setCandle({ ...candle, ...hurst })),
    share()
  );

  const buy$ = hurst$.pipe(
    crossunder(
      ([, hurst]) => hurst.lower,
      ([candle]) => candle.low
    ),
    withLatestFrom(session.balance(instrument.base), session.balance(instrument.quote)),
    filter(([n, btc, usdt]) => usdt.free > 100),
    tap(([[candle]]) => setLong({ rate: candle.close }))
  );

  const sell$ = hurst$.pipe(
    crossunder(
      ([, hurst]) => hurst.upper,
      ([candle]) => candle.close
    ),
    crossover(
      ([, hurst]) => hurst.upper,
      ([candle]) => candle.close
    ),
    tap(([candle]) => setShort({ ...candle, rate: candle.close }))
  );

  return forkJoin([buy$, sell$]);
});

export function hurst(options: { length: number; multiplier: number }) {
  const length = Math.floor(options.length / 2);

  return function (
    source: Observable<Candle>
  ): Observable<[Candle, { lower: number; upper: number }]> {
    source = source.pipe(share());

    return source
      .pipe(
        withLatestFrom(
          source.pipe(
            rma(length, (it: Candle) => it.close),
            window(Math.floor(length / 2) + 1, ([, it]) => it),
            map(([, it]) => it.at(0))
          ),
          source.pipe(
            atr(length, (it: Candle) => it),
            map(([, it]) => it * options.multiplier)
          )
        )
      )
      .pipe(
        map(([candle, rma, atr]) => {
          const upper = rma + atr;
          const lower = rma - atr;

          return [candle, { lower, upper, atr }];
        })
      );
  };
}
