import { map } from 'rxjs';

import {
  AssetSelector,
  distinctUntilTimestampChanged,
  MissingAssetError,
  withMemo
} from '@quantform/core';

import { useBinanceBalancesChanges } from './use-binance-balances-changes';

/**
 * @title useBinanceBalanceChanges
 *
 * The code provided defines a function called `useBinanceBalanceChanges`, which
 * takes an `asset` parameter of type `AssetSelector`. It utilizes the
 * `useBinanceBalancesChanges` function and applies a series of operations on
 * its output.
 *
 * The `useBinanceBalancesChanges` function likely retrieves balance changes
 * for Binance assets. The output is an object where each asset ID maps to
 * its corresponding balance change.
 *
 * The code checks if the `asset` provided exists in the balance changes object.
 * If it doesn't, it throws a `MissingAssetError` indicating the asset is missing.
 * If the asset exists, it retrieves the balance change for that asset.
 *
 * The function then applies the `distinctUntilTimestampChanged` operator to ensure
 * that only distinct balance changes are emitted based on their timestamp.
 *
 * Overall, the `useBinanceBalanceChanges` function is designed to provide a stream
 * of balance changes for a specific Binance asset, ensuring that only distinct
 * changes are emitted.
 */
export const useBinanceBalanceChanges = withMemo((asset: AssetSelector) =>
  useBinanceBalancesChanges().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    }),
    distinctUntilTimestampChanged()
  )
);
