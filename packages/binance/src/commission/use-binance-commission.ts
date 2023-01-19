import { map } from 'rxjs';

import { Commission, d } from '@quantform/core';

import { useBinanceConnectorAccount } from '@lib/use-binance-connector-account';

export function useBinanceCommission() {
  return useBinanceConnectorAccount().pipe(map(binanceToCommission));
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
