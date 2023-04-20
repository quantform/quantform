import { map, of, switchMap } from 'rxjs';

import { useBinanceInstrument } from '@lib/instrument';
import { d, InstrumentSelector, missed, use } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

export const useBinanceTrade = use((instrument: InstrumentSelector) =>
  useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === missed) {
        return of(missed);
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

      return useBinanceTradeSocket(it).pipe(
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
