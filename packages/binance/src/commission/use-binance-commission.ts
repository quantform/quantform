import { defer, map, of } from 'rxjs';

import { useBinanceSimulatorOptions } from '@lib/use-binance-simulator-options';
import { useBinanceUserAccountRequest } from '@lib/user/use-binance-user-account-request';
import { Commission, d, useSimulator } from '@quantform/core';

/**
 * @title useBinanceCommission
 * @description
 * A hook that retrieves and subscribes to the commission rate for trading on the Binance
 * exchange.
 *
 * An observable stream of the commission rate.
 */
export function useBinanceCommission() {
  return useSimulator(
    defer(() => of(useBinanceSimulatorOptions().commission)),
    useBinanceUserAccountRequest().pipe(map(binanceToCommission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
