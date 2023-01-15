import { from, Observable, of, shareReplay, switchMap } from 'rxjs';

import { useFake, withMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export const useBinanceAccount = withMemo(binanceAccount);

function binanceAccount(): Observable<{ balances: any[] }> {
  return useFake(useBinanceRealAccount, useBinanceFakeAccount)().pipe(shareReplay(1));
}

function useBinanceRealAccount() {
  return useBinanceConnector().pipe(switchMap(it => from(it.account())));
}

function useBinanceFakeAccount() {
  return of({
    makerCommission: 10,
    takerCommission: 10
  });
}
