import { BinanceAdapter } from '@quantform/binance';
import {
  atr,
  Candle,
  candle,
  ema,
  instrumentOf,
  Position,
  Session,
  sma,
  Timeframe,
  window
} from '@quantform/core';
import { SQLiteFeed, SQLiteMeasurement } from '@quantform/sqlite';
import { combineLatest, map, Observable, share, tap, withLatestFrom } from 'rxjs';

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
    from: Date.parse('2021-06-01'),
    to: Date.parse('2022-04-01')
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
            borderVisible: false,
            upColor: '#74fba8',
            downColor: '#e9334b'
          })
        ]
      }),
      pane({
        children: [
          linear({
            kind: 'candle',
            value: m => 1,
            color: '#f002'
          }),
          linear({
            kind: 'candle',
            value: m => 0,
            color: '#0f02'
          }),
          linear({
            kind: 'candle',
            value: m => m.hurst,
            color: '#0ff',
            lineWidth: 1
          })
        ]
      })
    ]
  })
};

export default studio(3000, (session: Session) => {
  const [, setCandle] = session.useMeasure({ kind: 'candle' });

  return session.trade(instrumentOf('binance:eth-usdt')).pipe(
    candle(Timeframe.M1 / 12, it => it.rate),
    // hurst({ length: 30, multiplier: 3 }),
    tap(candle => setCandle({ ...candle, hurst: 0 }))
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
