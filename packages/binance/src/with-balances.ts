import { combineLatest, map } from 'rxjs';

import { withUserAccountRequest } from '@lib/api/with-user-account-request';
import { AssetSelector, d } from '@quantform/core';

import { withAssets } from './with-assets';

export function withBalances() {
  return combineLatest([withAssets(), withUserAccountRequest()]).pipe(
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
}
