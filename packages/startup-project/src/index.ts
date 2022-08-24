import { binance } from '@quantform/binance';
import {
  Candle,
  candle,
  candleCompleted,
  decimal,
  instrumentOf,
  Logger,
  Timeframe
} from '@quantform/core';
import { dydx, DyDxOptions } from '@quantform/dydx';
import { sqlite } from '@quantform/sqlite';
import {
  candlestick,
  layout,
  linear,
  pane,
  study,
  StudySession
} from '@quantform/studio';
import { combineLatest, finalize, forkJoin, map } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';

require('dotenv').config();

export const descriptor = {
  adapter: [dydx(DyDxOptions.Ropsten), binance()],
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
    backgroundBottomColor: '#171722',
    backgroundTopColor: '#1c1c28',
    borderColor: '#3f3f46',
    gridColor: '#222',
    textColor: '#fff',
    children: [
      pane({
        children: [
          linear({
            kind: 'bid',
            scale: 8,
            color: '#0f0',
            map: m => ({ value: m.value.high })
          }),
          linear({
            kind: 'ask',
            scale: 8,
            color: '#f00',
            map: m => ({ value: m.value.high })
          })
        ]
      }),
      pane({
        children: []
      })
    ]
  })
};

export default study(3000, (session: StudySession) => {
  const [, setBid] = session.useMeasure<{ timestamp: number; value: Candle }>({
    kind: 'bid'
  });
  const [, setAsk] = session.useMeasure<{ timestamp: number; value: Candle }>({
    kind: 'ask'
  });

  const ob$ = combineLatest([
    session.orderbook(instrumentOf('dydx:eth-usd')),
    session.orderbook(instrumentOf('binance:eth-busd'))
  ]);

  const bid$ = ob$.pipe(
    map(([dydx, binance]) => ({
      timestamp: Math.max(dydx.timestamp, binance.timestamp),
      spread: dydx.bids.rate.minus(binance.bids.rate).abs()
    })),
    candle(Timeframe.S1 * 5, it => it.spread),
    candleCompleted(),
    map(it => setBid({ timestamp: it.timestamp, value: it }))
  );

  const ask$ = ob$.pipe(
    map(([dydx, binance]) => ({
      timestamp: Math.max(dydx.timestamp, binance.timestamp),
      spread: dydx.asks.rate.minus(binance.asks.rate).abs()
    })),
    candle(Timeframe.S1 * 5, it => it.spread),
    candleCompleted(),
    map(it => setAsk({ timestamp: it.timestamp, value: it }))
  );

  return combineLatest([bid$, ask$]);
});
