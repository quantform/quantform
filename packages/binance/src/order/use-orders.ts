import { combineLatest, map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  connected,
  instrumentNotSupported,
  InstrumentSelector,
  use
} from '@quantform/core';

import { useOrderSocket } from './use-order-socket';
import { useOrdersRequest } from './use-orders-request';

export const useOrders = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return combineLatest([
        useOrderSocket(instrument),
        useOrdersRequest(instrument).pipe(
          map(it =>
            it.reduce((snapshot, it) => {
              snapshot[it.id] = it;

              return snapshot;
            }, {} as Record<string, (typeof it)[number]>)
          )
        )
      ]).pipe(
        map(([it, snapshot]) => {
          if (it !== undefined && it !== connected) {
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
