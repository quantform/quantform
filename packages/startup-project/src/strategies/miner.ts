import { BinanceAdapter } from '@quantform/binance';
import { BinanceFutureAdapter } from '@quantform/binance-future';
import { assetOf, instrumentOf, Session, Orderbook } from '@quantform/core';
import { SQLiteStorageFactory } from '@quantform/sqlite';
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
  adapter: [new BinanceAdapter(), new BinanceFutureAdapter()],
  storage: new SQLiteStorageFactory(),
  simulation: {
    balance: {
      'binance:btc': 0.05,
      'binance:usdt': 100
    },
    from: Date.parse('2021-06-01'),
    to: Date.parse('2022-04-09')
  },
  ...layout({
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
  const [, save] = session.useMeasure({ kind: 'spread' });

  return session
    .orderbook(instrumentOf('binance:eth-btc'))
    .pipe(tap(it => save({ spread: it.bestAskRate - it.bestBidRate })));
});
/*
export default study(3000, (session: StudySession) => {
  const reefbtc = instrumentOf('binance:lina-btc');
  const reefusdt = instrumentOf('binance:lina-usdt');
  const reefusdtf = instrumentOf('binancefuture:lina-usdt');
  const btcusdt = instrumentOf('binance:btc-usdt');

  const [, storeMeasure] = session.useMeasure(
    { kind: 'range' },
    { timestamp: 0, upper: 0, lower: 0, base: 0, future: 0 }
  );

  const [, storeRate] = session.useMeasure(
    { kind: 'rate' },
    { timestamp: 0, bid: 0, ask: 0 }
  );

  return combineLatest([
    session.orderbook(reefbtc),
    session.orderbook(reefusdt),
    session.orderbook(reefusdtf),
    session.orderbook(btcusdt)
  ]).pipe(
    map(([reefbtc, reefusdt, reefusdtf, btcusdt]) => {
      const upper = reefbtc.bestAskRate * btcusdt.bestBidRate;
      const lower = reefbtc.bestBidRate * btcusdt.bestAskRate;

      storeMeasure({
        timestamp: reefbtc.timestamp,
        base: reefusdt.bestBidRate,
        upper,
        lower,
        future: reefusdtf.bestBidRate
      });

      storeRate({
        timestamp: reefbtc.timestamp,
        bid: reefbtc.bestBidRate,
        ask: reefbtc.bestAskRate
      });
    })
  );
});
*/
