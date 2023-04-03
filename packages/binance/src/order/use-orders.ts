import { concatAll, from, map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { useOrderSocket } from './use-order-socket';
import { useOrdersRequest } from './use-orders-request';

export const useOrders = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useOrdersRequest(instrument).pipe(
        map(it =>
          it.reduce((snapshot, it) => {
            snapshot[it.id] = it;

            return snapshot;
          }, {} as Record<string, (typeof it)[number]>)
        ),
        switchMap(snapshot =>
          from([
            of(snapshot),
            useOrderSocket(instrument).pipe(
              map(it => {
                if (it !== undefined) {
                  if (snapshot[it.id]) {
                    Object.assign(snapshot[it.id], it);
                  } else {
                    snapshot[it.id] = it;
                  }

                  if (!it.cancelable) {
                    delete snapshot[it.id];
                  }
                }

                return snapshot;
              })
            )
          ]).pipe(concatAll())
        )
      );
    })
  )
);
