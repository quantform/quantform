import { combineLatest, map, tap } from 'rxjs';
import { v4 } from 'uuid';

import { withAssets } from '@lib/asset';
import { withSimulator } from '@lib/simulator';
import { withUserAccount } from '@lib/user/with-user-account';
import { AssetSelector, d, useExecutionMode } from '@quantform/core';

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

function withBinanceBalances() {
  return combineLatest([withAssets(), withUserAccount()]).pipe(
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

export type withBalancesType = typeof withBinanceBalances;

export const withBalances = (): ReturnType<withBalancesType> => {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return withBinanceBalances();
  }

  const { apply } = withSimulator();

  return apply({ type: 'with-balances-command', args: [], correlationId: v4() }).pipe(
    tap(it => console.log('lol', it))
  );
};
