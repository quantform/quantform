import { map } from 'rxjs';

import { useBinanceConnectorAccount } from '@lib/use-binance-connector-account';
import { Commission, d } from '@quantform/core';

export function useBinanceCommission() {
  return useBinanceConnectorAccount().pipe(map(binanceToCommission));
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
