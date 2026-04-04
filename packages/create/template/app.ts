import { combineLatest, tap } from 'rxjs';

import { app, useLogger } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useBinance } from './binance/use-binance';

export function triangularArbitrageInefficiency() {
  const { watchTrade } = useBinance();
  const { info } = useLogger('arbitrage');

  return combineLatest([
    watchTrade('btcusdc'),
    watchTrade('ethusdc'),
    watchTrade('ethbtc')
  ]).pipe(
    tap(([btcusdc, ethusdc, ethbtc]) => {
      const spread = ethusdc.div(btcusdc).sub(ethbtc).abs();

      info(`spread: ${spread.toFixed(6)}`);
    })
  );
}

export default app().use(sqlite()).start(triangularArbitrageInefficiency);
