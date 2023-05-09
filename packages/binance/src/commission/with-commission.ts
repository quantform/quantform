import { defer, map, of } from 'rxjs';

import { withUserAccount } from '@lib/user/with-user-account';
import { withSimulatorOptions } from '@lib/with-simulator-options';
import { Commission, d, useSimulator } from '@quantform/core';

/**
 * @title useBinanceCommission
 * @description
 * A hook that retrieves and subscribes to the commission rate for trading on the Binance
 * exchange.
 *
 * An observable stream of the commission rate.
 */
export function withCommission() {
  return useSimulator(
    defer(() => of(withSimulatorOptions().commission)),
    withUserAccount().pipe(map(binanceToCommission))
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
