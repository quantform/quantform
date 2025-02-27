import { map, switchMap } from 'rxjs';

import { watchTradeSocket } from '@lib/api/when-trade-socket';
import { getInstrument } from '@lib/instrument/get-instrument';
import { d, InstrumentSelector } from '@quantform/core';

export function watchTrade(instrument: InstrumentSelector) {
  return getInstrument(instrument).pipe(
    switchMap(it => {
      const trade = {
        timestamp: 0,
        instrument,
        rate: d.Zero,
        quantity: d.Zero,
        isBuyerMarketMaker: false
      };

      return watchTradeSocket(it.raw.toLowerCase()).pipe(
        map(({ timestamp, payload }) => {
          trade.timestamp = timestamp;
          trade.quantity = d(payload.q);
          trade.rate = d(payload.p);
          trade.isBuyerMarketMaker = payload.m;

          return trade;
        })
      );
    })
  );
}
