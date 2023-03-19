import { defer, map, of } from 'rxjs';

import { useAccountSnapshot } from '@lib/use-account-snapshot';
import { useSimulatorOptions } from '@lib/use-simulator-options';
import { Commission, d, useSimulator } from '@quantform/core';

/**
 * @title useBinanceCommission
 * @description
 * A hook that retrieves and subscribes to the commission rate for trading on the Binance
 * exchange.
 *
 * @returns {Observable<number>} An observable stream of the commission rate.
 */
export function useCommission() {
  return useSimulator(
    defer(() => of(useSimulatorOptions().commission)),
    useAccountSnapshot().pipe(map(binanceToCommission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
