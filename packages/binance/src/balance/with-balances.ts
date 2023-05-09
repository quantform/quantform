import { combineLatest, map } from 'rxjs';

import { withAssets } from '@lib/asset';
import { withUserAccount } from '@lib/user/with-user-account';
import { AssetSelector, d } from '@quantform/core';

/**
 * @title useBinanceBalances()
 *
 * Retrieves the Binance account balance snapshot for the current user by combining
 * asset information with user account requests.
 *
 * @example
 * ```
 * // pipes an array of non zero balances
 * const balances = useBinanceBalances().pipe(
 *   map(it => Object.values(it).filter(it => it.free.gt(d.Zero) || it.locked.gt(d.Zero)))
 * );
 * ```
 */

export const withBalances = () =>
  combineLatest([withAssets(), withUserAccount()]).pipe(
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
