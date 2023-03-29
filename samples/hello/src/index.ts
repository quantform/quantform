import * as dotenv from 'dotenv';
import { forkJoin, mergeMap, Observable } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  assetOf,
  Commission,
  d,
  Dependency,
  instrumentOf,
  withCore
} from '@quantform/core';
import { sqlLite } from '@quantform/sqlite';

import { useOrderRisk } from './risk/use-order-risk';
import { useArbitrageProfit } from './use-arbitrage-profit';
import { useOrderSettled } from './use-order-settled';

dotenv.config();

export const module2: Dependency[] = [
  ...withCore(),
  ...Binance({
    simulator: {
      commission: Commission.Zero
    }
  }),
  sqlLite()
];

export default function (): Observable<any> {
  return forkJoin([
    useArbitrageProfit(
      assetOf('binance:jasmy'),
      assetOf('binance:usdt'),
      assetOf('binance:btc')
    ),
    useOrderSettled(instrumentOf('binance:btc-usdt')).pipe(
      mergeMap(it => useOrderRisk(it.id, it.instrument, it.rate ?? d.Zero))
    )
  ]);
}
