import { filter, map } from 'rxjs';

import { useBinanceUserSocket } from '@lib/use-binance-user-socket';
import { d } from '@quantform/core';

import { BinanceBalance } from './use-binance-balances';

export const useBinanceBalancesSocket = (balances: Record<string, BinanceBalance>) =>
  useBinanceUserSocket().pipe(
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
