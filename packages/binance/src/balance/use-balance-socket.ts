import { concatMap, filter } from 'rxjs';

import { useUserSocket } from '@lib/user';
import { connected, d, disconnected, exclude, use } from '@quantform/core';

export const useBalanceSocket = use(() =>
  useUserSocket().pipe(
    exclude(connected),
    exclude(disconnected),
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
