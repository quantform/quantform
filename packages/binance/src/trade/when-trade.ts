import { map, switchMap } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { whenSimulator } from '@lib/simulator';
import { d, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

function whenBinanceTrade(instrument: InstrumentSelector) {
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
        })
      );
    })
  );
}

export type whenTradeType = typeof whenBinanceTrade;

export const whenTrade = withMemo((...args: Parameters<whenTradeType>) =>
  whenSimulator(whenBinanceTrade, 'when-trade', args)
);
