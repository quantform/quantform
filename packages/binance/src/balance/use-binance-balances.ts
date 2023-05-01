import { combineLatest, map } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceUserAccountRequest } from '@lib/user/use-binance-user-account-request';
import { AssetSelector, d } from '@quantform/core';

/**
 * @title useBinanceBalances
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
