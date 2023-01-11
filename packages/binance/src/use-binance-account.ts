import { from, Observable, of, shareReplay, switchMap } from 'rxjs';

import { withFake, withMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export const useBinanceAccount = withMemo(binanceAccount);

function binanceAccount(): Observable<{ balances: any[] }> {
  return withFake(useBinanceRealAccount, useBinanceFakeAccount)().pipe(shareReplay(1));
}

function useBinanceRealAccount() {
  return useBinanceConnector().pipe(switchMap(it => from(it.account())));
}

function useBinanceFakeAccount() {
  return of({});
}
