import { from, Observable, shareReplay, switchMap } from 'rxjs';

import { withMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export const useBinanceAccount = withMemo(binanceAccount);

function binanceAccount(): Observable<{ balances: any[] }> {
  return useBinanceConnector().pipe(
    switchMap(it => from(it.account())),
    shareReplay(1)
  );
}
