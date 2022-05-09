import { binance, BinanceAdapter } from '@quantform/binance';
import {
  atr,
  Candle,
  candle,
  candleCompleted,
  crossunder,
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
    from: Date.parse('2022-01-01'),
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
                kind: 'long',
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
          linear({
            key: 'equity-benchmark',
            kind: 'equity',
            color: '#FFFF00',
            scale: 2,
            lineWidth: 1,
            lastValueVisible: false,
            priceLineVisible: false,
            map: m => ({
              value: m.benchmark
            })
          }),
          linear({
            key: 'equity-performance',
            kind: 'equity',
            scale: 2,
            lineWidth: 1,
            color: '#00ffff',
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
  const [, setLong] = session.useMeasure<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    rate: number;
  }>({ kind: 'long' });

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
    mergeCandle(timeframe, it => it.rate, session.history(instrument, timeframe, 40)),
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
    candle$.pipe(candleCompleted()).pipe(take(1)),
    session.balance(instrument.base).pipe(take(1)),
    session.balance(instrument.quote).pipe(take(1))
  ]).pipe(
    map(
      ([trade, firstTrade, base, quote]) =>
        base.total * trade.close + (quote.total / firstTrade.close) * trade.close
    ),
    distinctUntilChanged()
  );

  const equity$ = combineLatest([performance$, benchmark$]).pipe(
    map(([performance, benchmark]) => setEquity({ benchmark, performance }))
  );

  const p$ = candle$.pipe(
    candleCompleted(),
    tap(candle => setCandle({ ...candle })),
    hurst({ length: 50, multiplier: 3 }),
    tap(([candle, hurst]) => setCandle({ ...candle, ...hurst })),
    tap(it => console.log(new Date(it[0].timestamp))),
    crossunder(
      ([, hurst]) => hurst.lower,
      ([candle]) => candle.close
    ),
    tap(([candle]) => setLong({ ...candle, rate: candle.close })),
    tap(it => console.log('OPEN')),
    switchMap(it => session.open(Order.market(instrument, 20)))
  );

  return forkJoin([p$, equity$]);
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
