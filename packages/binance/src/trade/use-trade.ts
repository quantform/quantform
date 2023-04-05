import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { d, InstrumentSelector, notFound, use } from '@quantform/core';

import { useTradeSocket } from './use-trade-socket';

export const useTrade = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === notFound) {
        return of(notFound);
      }

      const trade = {
        timestamp: 0,
        instrument,
        rate: d.Zero,
        quantity: d.Zero,
        buyerOrderId: 0,
        sellerOrderId: 0,
        isBuyerMarketMaker: false
      };

      return useTradeSocket(it).pipe(
        map(({ timestamp, payload }) => {
          trade.timestamp = timestamp;
          trade.quantity = d(payload.q);
          trade.rate = d(payload.p);
          trade.buyerOrderId = payload.b;
          trade.sellerOrderId = payload.a;
          trade.isBuyerMarketMaker = payload.m;

          return trade;
        })
      );
    })
  )
);
