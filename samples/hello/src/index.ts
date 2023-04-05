import * as dotenv from 'dotenv';
import { forkJoin, mergeMap, Observable } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  assetOf,
  Commission,
  core,
  d,
  Dependency,
  instrumentOf,
  strat
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useOrderRisk } from './risk/use-order-risk';
import { useArbitrageProfit } from './use-arbitrage-profit';
import { useEnter } from './use-enter';
import { useOrderSettled } from './use-order-settled';

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
      // Binance.useOrderbookTicker(instrumentOf('binance:btc-usdt'))

      /* useOrderSettled(instrumentOf('binance:dock-btc')).pipe(
      mergeMap(it => useOrderRisk(it.id, it.instrument, it.rate ?? d.Zero))
    )*/
    ]),
  [...Binance({}), sqlite()]
);
