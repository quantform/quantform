import { binance, BinanceAdapter } from '@quantform/binance';
import { assetOf, instrumentOf, Orderbook, Session } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import {
  candlestick,
  layout,
  linear,
  pane,
  study,
  StudySession
} from '@quantform/studio';
import { combineLatest, distinctUntilChanged, filter, map, tap } from 'rxjs';

export const descriptor = {
  adapter: [binance()],
  storage: sqlite(),
  simulation: {
    balance: {
      'binance:btc': 0.05,
      'binance:usdt': 100
    },
    from: Date.parse('2021-06-01'),
    to: Date.parse('2022-04-09')
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
            kind: 'range',
            color: '#ff0',
            scale: 8,
            map: m => ({ value: m.base })
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
  const [, setPrice] = session.useMeasure({ kind: 'price' });

  return session.orderbook(instrumentOf('binance:eth-btc'));
});
