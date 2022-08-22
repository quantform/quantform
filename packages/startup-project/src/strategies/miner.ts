import {
  candle,
  candleCompleted,
  decimal,
  instrumentOf,
  Logger,
  Timeframe
} from '@quantform/core';
import { dydx } from '@quantform/dydx';
import { sqlite } from '@quantform/sqlite';
import { layout, linear, pane, study, StudySession } from '@quantform/studio';
import { map, tap } from 'rxjs';

export const descriptor = {
  adapter: [dydx()],
  storage: sqlite(),
  simulation: {
    balance: {
      'binance:btc': 0.05,
      'binance:usdt': 100
    },
    from: Date.parse('2022-01-01'),
    to: Date.parse('2022-06-01')
  },
  ...layout({
    upColor: '#74fba8',
    downColor: '#e9334b',
    backgroundBottomColor: '#111',
    backgroundTopColor: '#000',
    borderColor: '#3f3f46',
    gridColor: '#222',
    textColor: '#fff',
    children: [
      pane({
        children: [
          linear({
            kind: 'price',
            color: '#f00',
            scale: 8,
            map: m => ({ value: m.value })
          }),
          linear({
            kind: 'range',
            color: '#f00',
            scale: 8,
            map: m => ({ value: m.upper })
          }),
          linear({
            kind: 'range',
            color: '#0f0',
            scale: 8,
            map: m => ({ value: m.lower })
          }),
          linear({
            kind: 'range',
            color: '#0ff',
            scale: 8,
            map: m => ({ value: m.future })
          })
        ]
      }),
      pane({
        children: [
          linear({
            kind: 'rate',
            color: '#f00',
            scale: 8,
            map: m => ({ value: m.ask })
          }),
          linear({
            kind: 'rate',
            color: '#0f0',
            scale: 8,
            map: m => ({ value: m.bid })
          })
        ]
      })
    ]
  })
};

export default study(3000, (session: StudySession) => {
  const [, setPrice] = session.useMeasure<{ timestamp: number; value: decimal }>({
    kind: 'price'
  });

  return session
    .orderbook(instrumentOf('dydx:btc-usd'))
    .pipe(
      map(it =>
        console.log(
          `${it.asks.rate} (${it.asks.quantity}) - ${it.bids.rate} (${it.bids.quantity})`
        )
      )
    );
});
