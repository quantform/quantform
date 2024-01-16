import { defer, map, of } from 'rxjs';

import { useSimulatorOptions } from '@lib/simulator/use-simulator-options';
import { withUserAccount } from '@lib/user/with-user-account';
import { Commission, d, useCache, useSimulator } from '@quantform/core';

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
    defer(() => of(useSimulatorOptions().commission)),
    defer(() =>
      useCache(withUserAccount().pipe(map(binanceToCommission)), ['binance/commission'])
    )
  );
}

export function binanceToCommission(response: any) {
  return new Commission(
    d(response.makerCommission).div(100),
    d(response.takerCommission).div(100)
  );
}
