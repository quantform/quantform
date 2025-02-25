import { tap } from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import { behavior, Commission, instrumentOf, strategy, useLogger } from '@quantform/core';

export default strategy(() => {
  behavior(() => {
    // watch binance spot orderbook
    const { whenOrderbookTicker } = useBinance();
    const { info } = useLogger('binance');

    // subscribe for btc-usdt binance spot market and print ticker values
    return whenOrderbookTicker(instrumentOf(`binance:btc-usdt`)).pipe(
      tap(({ bids, asks }) => info(`current top bid: ${bids.rate}, ask: ${asks.rate}`))
    );
  });

  return [
    ...binance({
      simulator: {
        balance: {},
        commission: Commission.Zero
      }
    })
  ];
});
