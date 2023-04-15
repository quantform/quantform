import { combineLatest, map } from 'rxjs';

import { useAssets } from '@lib/asset';
import { useUserAccountRequest } from '@lib/user/use-user-account-request';
import { AssetSelector, d } from '@quantform/core';

export const useBalancesSnapshot = () =>
  combineLatest([useAssets(), useUserAccountRequest()]).pipe(
    map(([assets, { timestamp, payload }]) =>
      payload.balances
        .map(it => ({
          timestamp,
          asset: assets[new AssetSelector(it.asset.toLowerCase(), 'binance').id],
          free: d(it.free),
          locked: d(it.locked)
        }))
        .filter(it => it.asset !== undefined)
    )
  );
