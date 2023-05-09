import { catchError, map, merge, of, retry, switchMap, throwError } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { useOptions } from '@lib/use-options';
import { d, errored, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

export const useBinanceTradeChanges = withMemo((instrument: InstrumentSelector) => {
  const { retryDelay } = useOptions();

  return withInstrument(instrument).pipe(
    switchMap(it => {
      const trade = {
        timestamp: 0,
        instrument,
        rate: d.Zero,
        quantity: d.Zero,
        buyerOrderId: 0,
        sellerOrderId: 0,
        isBuyerMarketMaker: false
      };

      return useBinanceTradeSocket(it).pipe(
        map(({ timestamp, payload }) => {
          trade.timestamp = timestamp;
          trade.quantity = d(payload.q);
          trade.rate = d(payload.p);
          trade.buyerOrderId = payload.b;
          trade.sellerOrderId = payload.a;
          trade.isBuyerMarketMaker = payload.m;

          return trade;
        }),
        catchError(e =>
          merge(
            of(errored),
            throwError(() => e)
          )
        )
      );
    }),
    retry({ delay: retryDelay })
  );
});
