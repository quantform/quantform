import { concatMap, filter } from 'rxjs';

import { useUserChanges } from '@lib/use-user-changes';
import { d, use } from '@quantform/core';

export const useBalanceSocket = use(() =>
  useUserChanges().pipe(
    filter(it => it.payload.e === 'outboundAccountPosition'),
    concatMap(it => {
      if (it.payload.e !== 'outboundAccountPosition') {
        return [];
      }

      return it.payload.B.map(payload => ({
        timestamp: it.timestamp,
        assetSelector: `binance:${payload.a.toLowerCase()}`,
        available: d(payload.f),
        unavailable: d(payload.l)
      }));
    })
  )
);
