import { combineLatest, map, of, switchMap } from 'rxjs';

import { useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, notFound, use } from '@quantform/core';

import { useBinanceOrderSocket } from './use-binance-order-socket';
import { useBinanceOrdersRequest } from './use-binance-orders-request';

export const useBinanceOrders = use((instrument: InstrumentSelector) =>
  useBinanceInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === notFound) {
        return of(notFound);
      }

      return combineLatest([
        useBinanceOrderSocket(instrument),
        useBinanceOrdersRequest(instrument).pipe(
          map(it =>
            it.reduce((snapshot, it) => {
              snapshot[it.id] = it;

              return snapshot;
            }, {} as Record<string, (typeof it)[number]>)
          )
        )
      ]).pipe(
        map(([it, snapshot]) => {
          if (it !== undefined) {
            if (snapshot[it.id]) {
              if (snapshot[it.id].timestamp < it.timestamp) {
                Object.assign(snapshot[it.id], it);
              }
            } else {
              snapshot[it.id] = it;
            }

            if (!it.cancelable) {
              delete snapshot[it.id];
            }
          }

          return snapshot;
        })
      );
    })
  )
);