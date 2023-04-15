import { combineLatest, filter, map } from 'rxjs';

import { useAssets } from '@lib/asset';
import { useUserSocket } from '@lib/user';
import { AssetSelector, d, use } from '@quantform/core';

export const useBalanceSocket = use(() =>
  combineLatest([useUserSocket(), useAssets()]).pipe(
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
