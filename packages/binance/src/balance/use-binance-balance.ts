import { map } from 'rxjs';

import { AssetSelector, MissingAssetError } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

export const useBinanceBalance = (asset: AssetSelector) =>
  useBinanceBalances().pipe(
    map(it => {
      const balance = it.find(it => it.asset.id === asset.id);

      if (!balance) {
        throw new MissingAssetError(asset);
      }

      return balance;
    })
  );
