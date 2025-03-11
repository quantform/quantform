import { combineLatest, filter, map } from 'rxjs';

import { getAssets } from '@lib/asset/get-assets';
import { AssetSelector, d } from '@quantform/core';

import { whenUserAccountSocket } from './when-user-account-socket';

export const useBinanceBalanceSocket = () =>
  combineLatest([whenUserAccountSocket(), getAssets()]).pipe(
    filter(([{ payload }]) => payload.e === 'outboundAccountPosition'),
    map(([{ timestamp, payload }, assets]) => {
      if (payload.e !== 'outboundAccountPosition') {
        return [];
      }

      return payload.B.map(it => ({
        timestamp: timestamp,
        asset: assets[new AssetSelector(it.a.toLowerCase(), 'binance').id],
        free: d(it.f),
        locked: d(it.l)
      })).filter(it => it.asset !== undefined);
    })
  );
