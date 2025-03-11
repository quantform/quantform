import { map } from 'rxjs';

import { AssetSelector, MissingAssetError } from '@quantform/core';

import { getBalances } from './get-balances';

export const getBalance = (asset: AssetSelector) =>
  getBalances().pipe(
    map(it => {
      const balance = it.find(it => it.asset.id === asset.id);

      if (!balance) {
        throw new MissingAssetError(asset);
      }

      return balance;
    })
  );
