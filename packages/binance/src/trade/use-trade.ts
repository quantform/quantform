import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  connected,
  d,
  disconnected,
  ignore,
  instrumentNotSupported,
  InstrumentSelector,
  use
} from '@quantform/core';

import { useTradeSocket } from './use-trade-socket';

export const useTrade = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
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
        ignore(connected),
        map(it => {
          if (it === disconnected) {
            return trade;
          }

          trade.timestamp = it.timestamp;
          trade.quantity = d(it.payload.q);
          trade.rate = d(it.payload.p);
          trade.buyerOrderId = it.payload.b;
          trade.sellerOrderId = it.payload.a;
          trade.isBuyerMarketMaker = it.payload.m;

          return trade;
        })
      );
    })
  )
);
