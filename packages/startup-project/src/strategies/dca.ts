import { BinanceAdapter } from '@quantform/binance';
import {
  atr,
  Candle,
  candle,
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
import { SQLiteStorageFactory } from '@quantform/sqlite';
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
  filter,
  interval,
  map,
  Observable,
  share,
  switchMap,
  tap,
  throttle,
  withLatestFrom
} from 'rxjs';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  storage: new SQLiteStorageFactory(),
  simulation: {
    balance: {
      'binance:btc': 1,
      'binance:usdt': 100
    },
    from: Date.parse('2021-06-01'),
    to: Date.parse('2021-06-09')
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
            scale: 5,
            kind: 'candle',
            map: m => m,
            borderVisible: false,
            upColor: '#74fba8',
            downColor: '#e9334b'
          }),
          linear({
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
          histogram({
            kind: 'candle',
            scale: 5,
            map: m => ({ value: m.atr })
          })
        ]
      }),
      pane({
        children: [
          bar({
            scale: 4,
            kind: 'candle',
            map: m => ({ ...m, color: m.close > 1.4 ? '#0ff' : '#f00' })
          })
        ]
      })
    ]
  })
};

export default study(3000, (session: StudySession) => {
  const [, setCandle] = session.useMeasure({ kind: 'candle' });
  const [, setLong] = session.useMeasure({ kind: 'long' });

  function stopLoss(unrealizedLoss: number) {
    return (source: Observable<Position>) =>
      source.pipe(
        filter(it => it.estimatedUnrealizedPnL < -unrealizedLoss),
        switchMap(it => session.open(Order.market(it.instrument, it.size)))
      );
  }

  return session.trade(instrumentOf('binance:lina-usdt')).pipe(
    mergeCandle(
      Timeframe.M1,
      it => it.rate,
      session.history(instrumentOf('binance:lina-usdt'), Timeframe.M1, 500)
    ),
    tap(candle => setCandle({ ...candle })),
    hurst({ length: 50, multiplier: 3 }),
    tap(([candle, hurst]) => setCandle({ ...candle, ...hurst })),
    crossunder(
      ([, hurst]) => hurst.lower,
      ([candle]) => candle.close
    ),
    tap(([candle]) => setLong({ ...candle, rate: candle.close }))
  );
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
