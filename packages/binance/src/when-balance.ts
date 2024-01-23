import { map } from 'rxjs';

import {
  AssetSelector,
  distinctUntilTimestampChanged,
  MissingAssetError,
  withMemo
} from '@quantform/core';

import { whenBalances } from './when-balances';

export const whenBalance = withMemo((asset: AssetSelector) =>
  whenBalances().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    }),
    distinctUntilTimestampChanged()
  )
);
