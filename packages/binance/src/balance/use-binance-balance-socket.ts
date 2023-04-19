import { combineLatest, filter, map } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceUserSocket } from '@lib/user';
import { AssetSelector, d, use } from '@quantform/core';

export const useBinanceBalanceSocket = use(() =>
  combineLatest([useBinanceUserSocket(), useBinanceAssets()]).pipe(
    filter(([{ payload }]) => payload.e === 'outboundAccountPosition'),
    map(([{ timestamp, payload }, assets]) => {
      if (payload.e !== 'outboundAccountPosition') {
        return [];
      }

      return payload.B.map(it => ({
        timestamp: timestamp,
        asset: assets[new AssetSelector(it.a.toLowerCase(), 'binance').id],
        free: d(it.f),
        locked: d(it.l)
      })).filter(it => it.asset !== undefined);
    })
  )
);
