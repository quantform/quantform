import { map } from 'rxjs';

import { AssetSelector, MissingAssetError, withMemo } from '@quantform/core';

import { getAssets } from './get-assets';

export const getAsset = withMemo((asset: AssetSelector) =>
  getAssets().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    })
  )
);
