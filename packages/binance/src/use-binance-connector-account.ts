import { Observable, of, shareReplay } from 'rxjs';

import { useFake, withMemo } from '@quantform/core';

import { useBinanceSignedRequest } from './use-binance-signed-request';

export const useBinanceConnectorAccount = withMemo(binanceConnectorAccount);

function binanceConnectorAccount(): Observable<{
  makerCommission: number;
  takerCommission: number;
  balances: any[];
}> {
  return useFake(useBinanceRealAccount, useBinanceFakeAccount)().pipe(shareReplay(1));
}

function useBinanceRealAccount() {
  return useBinanceSignedRequest<{
    makerCommission: number;
    takerCommission: number;
    balances: any[];
  }>({
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
}

function useBinanceFakeAccount() {
  return of({
    makerCommission: 10,
    takerCommission: 10,
    balances: []
  });
}
