import { defer, map, of } from 'rxjs';

import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceSimulator } from '@lib/use-binance-simulator';
import { Commission, d, useSimulator } from '@quantform/core';

export function useBinanceCommission() {
  return useSimulator(
    useBinanceAccount().pipe(map(binanceToCommission)),
    defer(() => of(useBinanceSimulator().commission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
