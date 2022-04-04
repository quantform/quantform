import { BinanceAdapter } from '@quantform/binance';
import { candle, instrumentOf, Session, Timeframe } from '@quantform/core';
import { SQLiteFeed, SQLiteMeasurement } from '@quantform/sqlite';
import { tap } from 'rxjs';

import { studio } from '../index';
import { candlestick, layout, linear, pane } from '../modules/measurement/layout';

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
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    textColor: '#fff',
    children: [
      pane({
        children: [
          candlestick({ kind: 'candle', value: m => m }),
          linear({ kind: 'candle', value: m => m.high }),
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

  return session.trade(instrumentOf('binance:btc-usdt')).pipe(
    candle(Timeframe.M1 / 12, it => it.rate),
    tap(it => setCandle(it))
  );
});
