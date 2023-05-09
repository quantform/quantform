import { map } from 'rxjs';

import { AssetSelector, MissingAssetError } from '@quantform/core';

import { withBalances } from './with-balances';

export const withBalance = (asset: AssetSelector) =>
  withBalances().pipe(
    map(it => {
      const balance = it.find(it => it.asset.id === asset.id);

      if (!balance) {
        throw new MissingAssetError(asset);
      }

      return balance;
    })
  );
