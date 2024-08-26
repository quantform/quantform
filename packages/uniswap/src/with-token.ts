import { map } from 'rxjs';

import { AssetSelector, MissingAssetError, withMemo } from '@quantform/core';

import { withTokens } from './with-tokens';

export const withToken = withMemo((asset: AssetSelector) =>
  withTokens().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    })
  )
);
