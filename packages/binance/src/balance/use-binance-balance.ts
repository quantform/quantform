import { map } from 'rxjs';

import { AssetSelector } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

export const useBinanceBalance = (asset: AssetSelector) =>
  useBinanceBalances().pipe(
    map(it => {
      const balance = it.find(it => it.asset.id === asset.id);

      if (!balance) {
        throw new Error('missing asset');
      }

      return balance;
    })
  );
