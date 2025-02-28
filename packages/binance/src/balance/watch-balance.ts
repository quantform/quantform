import { map } from 'rxjs';

import {
  AssetSelector,
  distinctUntilTimestampChanged,
  MissingAssetError,
  withMemo
} from '@quantform/core';

import { watchBalances } from './watch-balances';

export const watchBalance = withMemo((asset: AssetSelector) =>
  watchBalances().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    }),
    distinctUntilTimestampChanged()
  )
);
