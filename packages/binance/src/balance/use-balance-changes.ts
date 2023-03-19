import { filter, map } from 'rxjs';

import { useUserChanges } from '@lib/use-user-changes';
import { d } from '@quantform/core';

import { BinanceBalance } from './use-balances';

export const useBalanceChanges = (balances: Record<string, BinanceBalance>) =>
  useUserChanges().pipe(
    filter(it => it.payload.e === 'outboundAccountPosition'),
    map(it => {
      it.payload.B.forEach(payload => {
        const id = `binance:${payload.a.toLowerCase()}`;

        if (!balances[id]) {
          return;
        }

        balances[id].timestamp = it.timestamp;
        balances[id].available = d(payload.f);
        balances[id].unavailable = d(payload.l);
      });

      return balances;
    })
  );
