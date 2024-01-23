import { map, switchMap } from 'rxjs';

import { d, InstrumentSelector } from '@quantform/core';

import { whenTradeSocket } from './api/when-trade-socket';
import { withInstrument } from './with-instrument';

export function whenTrade(instrument: InstrumentSelector) {
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

      return whenTradeSocket(it.raw.toLowerCase()).pipe(
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
  );
}
