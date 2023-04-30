import { combineLatest, map } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceUserAccountRequest } from '@lib/user/use-binance-user-account-request';
import { AssetSelector, d } from '@quantform/core';

export const useBinanceBalances = () =>
  combineLatest([useBinanceAssets(), useBinanceUserAccountRequest()]).pipe(
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
