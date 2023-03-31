import { defer, map, of } from 'rxjs';

import { useSimulatorOptions } from '@lib/use-simulator-options';
import { useUserAccountRequest } from '@lib/user/use-user-account-request';
import { Commission, d, useSimulator } from '@quantform/core';

/**
 * @title useBinanceCommission
 * @description
 * A hook that retrieves and subscribes to the commission rate for trading on the Binance
 * exchange.
 *
 * An observable stream of the commission rate.
 */
export function useCommission() {
  return useSimulator(
    defer(() => of(useSimulatorOptions().commission)),
    useUserAccountRequest().pipe(map(binanceToCommission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
