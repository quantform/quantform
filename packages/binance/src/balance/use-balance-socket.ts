import { concatMap, filter } from 'rxjs';

import { useUserChanges } from '@lib/use-user-changes';
import { d } from '@quantform/core';

export const useBalanceSocket = () =>
  useUserChanges().pipe(
    filter(it => it.payload.e === 'outboundAccountPosition'),
    concatMap(it =>
      it.payload.B.map(payload => ({
        timestamp: it.timestamp,
        assetSelector: `binance:${payload.a.toLowerCase()}`,
        available: d(payload.f),
        unavailable: d(payload.l)
      }))
    )
  );
