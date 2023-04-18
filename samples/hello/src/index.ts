import * as dotenv from 'dotenv';
import { forkJoin } from 'rxjs';

import { binance } from '@quantform/binance';
import { assetOf, Commission, strat } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useArbitrageEntry } from './use-arbitrage-entry';
import { AnyDecision, arbitrageEntryDecision } from './use-arbitrage-entry-decision';
import { useArbitrageProfit } from './use-arbitrage-profit';

dotenv.config();

export default strat(
  () =>
    forkJoin([
      useArbitrageEntry(
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
    arbitrageEntryDecision(new AnyDecision()),
    ...binance({
      simulator: {
        commission: Commission.Zero
      }
    }),
    sqlite()
  ]
);
