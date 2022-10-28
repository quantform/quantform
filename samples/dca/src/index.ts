import { binance } from '@quantform/binance';
import {
  assetOf,
  d,
  instrumentOf,
  ohlc,
  ohlcCompleted,
  rule,
  simulate,
  Timeframe
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { study } from '@quantform/studio';
import { combineLatest, distinctUntilChanged, map, share, tap } from 'rxjs';

study('re-balance', 4000, () => {
  const assets = [
    assetOf('binance:btc'),
    assetOf('binance:eth'),
    assetOf('binance:usdt')
  ];

  const instruments = [
    instrumentOf('binance:eth-btc'),
    instrumentOf('binance:btc-usdt'),
    instrumentOf('binance:eth-usdt')
  ];

  rule('ensure everyday ratio', session => {
    const balances$ = combineLatest(assets.map(it => session.balance(it))).pipe(share());

    const isAnyOrderOpen$ = balances$.pipe(
      map(it => it.every(balance => balance.locked.isZero())),
      distinctUntilChanged(),
      tap(it => console.log(`trading ${it ? 'enabled' : 'disabled'}`)),
      share()
    );

    // build OHLC data based on executed trades for D1 timeframe
    const candles$ = combineLatest(
      instruments.map(it =>
        session.trade(it).pipe(
          ohlc(Timeframe.D1, it => it.rate),
          ohlcCompleted()
        )
      )
    ).pipe(share());

    const ratio$ = combineLatest([balances$, candles$]).pipe(map([[]]));

    return combineLatest([candles, isAnyOrderOpen$]).pipe();
  });

  return [
    binance(),
    sqlite(),
    simulate({
      period: { from: new Date('2022-06-01'), to: new Date('2022-10-01') },
      balance: [
        [assetOf('binance:btc'), d(0)],
        [assetOf('binance:eth'), d(0)],
        [assetOf('binance:usdt'), d(1000)]
      ]
    })
  ];
});
