import { map, retry } from 'rxjs';

import { useBinanceAccount } from '@lib/use-binance-account';
import { Commission, d } from '@quantform/core';

export function useBinanceCommission() {
  return useBinanceAccount().pipe(map(binanceToCommission));
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
