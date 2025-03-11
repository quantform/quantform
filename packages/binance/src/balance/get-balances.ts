import { combineLatest, map } from 'rxjs';

import { withUserAccountRequest } from '@lib/api/with-user-account-request';
import { getAssets } from '@lib/asset/get-assets';
import { AssetSelector, d } from '@quantform/core';

export function getBalances() {
  return combineLatest([getAssets(), withUserAccountRequest()]).pipe(
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
