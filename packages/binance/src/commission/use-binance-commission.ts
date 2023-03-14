import { defer, map, of } from 'rxjs';

import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceSimulator } from '@lib/use-binance-simulator';
import { Commission, d, useSimulator } from '@quantform/core';

/**
 * @title useBinanceCommission
 * @description
 * A hook that retrieves and subscribes to the commission rate for trading on the Binance
 * exchange.
 *
 * @returns {Observable<number>} An observable stream of the commission rate.
 */
export function useBinanceCommission() {
  return useSimulator(
    defer(() => of(useBinanceSimulator().commission)),
    useBinanceAccount().pipe(map(binanceToCommission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
