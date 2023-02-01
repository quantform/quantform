import { combineLatest, concat, filter, map, Observable, shareReplay, take } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceConnectorAccount } from '@lib/use-binance-connector-account';
import { useBinanceConnectorUserData } from '@lib/use-binance-connector-user-data';
import {
  Asset,
  AssetSelector,
  d,
  decimal,
  useState,
  useTimestamp
} from '@quantform/core';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

export function useBinanceBalances() {
  const [balances] = useState(binanceBalances(), [useBinanceBalances.name]);

  return balances;
}

function binanceBalances(): Observable<Record<string, BinanceBalance>> {
  const [balances] = useState<Record<string, BinanceBalance>>({}, [binanceBalances.name]);

  const start = combineLatest([useBinanceAssets(), useBinanceConnectorAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((balances: Record<string, BinanceBalance>, it) => {
        const { id, free, locked } = mapBinanceToBalance(it);

        const balance = balances[id];
        if (balance) {
          balance.timestamp = useTimestamp();
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];

          if (asset) {
            balances[id] = {
              timestamp: useTimestamp(),
              asset,
              available: free,
              unavailable: locked
            };
          }
        }

        return balances;
      }, balances)
    ),
    take(1)
  );

  return concat(
    start,
    useBinanceConnectorUserData().pipe(
      filter(it => it.payload.e === 'outboundAccountPosition'),
      map(it => {
        it.payload.B.forEach(payload => {
          const id = `binance:${payload.a.toLowerCase()}`;

          balances[id].timestamp = it.timestamp;
          balances[id].available = d(payload.f);
          balances[id].unavailable = d(payload.l);
        });

        return balances;
      }),

      shareReplay(1)
    )
  );
}

function mapBinanceToBalance(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}

function mapBinanceToBalancePosition(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
