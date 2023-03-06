import {
  combineLatest,
  concatAll,
  filter,
  from,
  map,
  of,
  shareReplay,
  switchMap
} from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceUserSocket } from '@lib/use-binance-user-socket';
import {
  asReadonly,
  Asset,
  AssetSelector,
  d,
  decimal,
  useTimestamp,
  withMemo
} from '@quantform/core';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

export const useBinanceBalances = withMemo(() => {
  const balances = {} as Record<string, BinanceBalance>;
  const changes = useBinanceBalancesChanges(balances);

  return useBinanceBalancesSnapshot(balances).pipe(
    switchMap(it => from([of(it), changes]).pipe(concatAll())),
    asReadonly(),
    shareReplay(1)
  );
});

const useBinanceBalancesSnapshot = (balances: Record<string, BinanceBalance>) =>
  combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((balances: Record<string, BinanceBalance>, it) => {
        const { id, free, locked } = mapBinanceToBalance(it);
        const timestamp = useTimestamp();

        const balance = balances[id];
        if (balance) {
          balance.timestamp = timestamp;
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];

          if (asset) {
            balances[id] = {
              timestamp,
              asset,
              available: free,
              unavailable: locked
            };
          }
        }

        return balances;
      }, balances)
    )
  );

const useBinanceBalancesChanges = (balances: Record<string, BinanceBalance>) =>
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

function mapBinanceToBalance(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
