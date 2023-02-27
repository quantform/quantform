import { map, of } from 'rxjs';

import { useBinanceAccount } from '@lib/use-binance-account';
import { Commission, d, useFake } from '@quantform/core';

export function useBinanceCommission() {
  return useFake(useBinanceAccount().pipe(map(binanceToCommission)), of(Commission.Zero));
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
