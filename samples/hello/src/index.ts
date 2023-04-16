import * as dotenv from 'dotenv';
import { forkJoin, tap } from 'rxjs';

import { binance, useBinanceOrderbookTicker } from '@quantform/binance';
import { assetOf, Commission, instrumentOf, strat } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useArbitrageProfit } from './use-arbitrage-profit';

dotenv.config();

export default strat(
  () =>
    forkJoin([
      useArbitrageProfit(
        assetOf('binance:jasmy'),
        assetOf('binance:usdt'),
        assetOf('binance:btc')
      )
      //useEnter(instrumentOf('binance:dock-btc')),

      /* useOrderSettled(instrumentOf('binance:dock-btc')).pipe(
      mergeMap(it => useOrderRisk(it.id, it.instrument, it.rate ?? d.Zero))
    )*/
    ]),
  [
    ...binance({
      simulator: {
        commission: Commission.Zero
      }
    }),
    sqlite()
  ]
);
