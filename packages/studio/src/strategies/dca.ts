import { BinanceAdapter } from '@quantform/binance';
import {
  atr,
  Candle,
  candle,
  ema,
  instrumentOf,
  Position,
  Session,
  Timeframe,
  window
} from '@quantform/core';
import { SQLiteFeed, SQLiteMeasurement } from '@quantform/sqlite';
import { map, Observable, share, tap, withLatestFrom } from 'rxjs';

import { studio } from '../index';
import { area, candlestick, layout, linear, pane } from '../modules/measurement/layout';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  feed: SQLiteFeed(),
  measurement: SQLiteMeasurement(),
  simulation: {
    balance: {
      'binance:btc': 1,
      'binance:usdt': 100
    },
    from: Date.parse('2020-01-01'),
    to: Date.parse('2021-01-01')
  },
  ...layout({
    backgroundBottomColor: '#282829',
    backgroundTopColor: '#282829',
    borderColor: '#3f3f46',
    textColor: '#fff',
    children: [
      pane({
        children: [
          candlestick({
            kind: 'candle',
            value: m => m,
            upColor: '#74fba8',
            downColor: '#e9334b'
          })
        ]
      }),
      pane({
        children: [
          area({
            kind: 'candle',
            value: m => m.hurst,
            topColor: '#0ff',
            lineWidth: 1
          })
        ]
      }),
      pane({
        children: [
          linear({
            kind: 'candle',
            value: m => m.low,
            markers: [
              { kind: 'candle', position: 'belowBar', shape: 'circle', color: '#0f0' }
            ]
          })
        ]
      })
    ]
  })
};

export default studio(3000, (session: Session) => {
  const [, setCandle] = session.useMeasure({ kind: 'candle' });

  return session.history(instrumentOf('binance:ape-usdt'), Timeframe.H1, 300).pipe(
    hurst({ length: 30, multiplier: 2 }),
    tap(([candle, hurst]) => setCandle({ ...candle, hurst }))
  );
});

export function hurst(options: { length: number; multiplier: number }) {
  const length = Math.floor(options.length / 2);

  return function (source: Observable<Candle>): Observable<[Candle, number]> {
    source = source.pipe(share());

    return source
      .pipe(
        withLatestFrom(
          source.pipe(
            ema(length, (it: Candle) => it.close),
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

          return [
            candle,
            Math.round(((candle.close - lower) / (upper - lower)) * 100) / 100
          ];
        })
      );
  };
}
