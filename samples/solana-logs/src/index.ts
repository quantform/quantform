import { combineLatest, tap } from 'rxjs';

import { app, useLogger } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useBinance } from './use-binance';

export function strategy() {
  const { watchAggTrade } = useBinance();
  const { info } = useLogger('usdc');

  return combineLatest([watchAggTrade('dogeeur'), watchAggTrade('dogeusdt')]).pipe(
    tap(([dogeeur, dogeusdt]) =>
      info(`eur/usdt: ${dogeusdt.payload.price.div(dogeeur.payload.price).toFixed(4)}`)
    )
  );
}

export default app().use(sqlite()).start(strategy);
