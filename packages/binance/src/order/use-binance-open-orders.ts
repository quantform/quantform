import { concatAll, from, of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { asReadonly, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceOpenOrdersRequest } from './use-binance-open-orders-request';
import { useBinanceOpenOrdersSocket } from './use-binance-open-orders-socket';

export const useBinanceOpenOrders = withMemo((instrument: InstrumentSelector) =>
  useBinanceInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useBinanceOpenOrdersRequest(instrument).pipe(
        switchMap(it =>
          from([of(it), useBinanceOpenOrdersSocket(instrument)]).pipe(concatAll())
        )
      );
    }),
    shareReplay(1),
    asReadonly()
  )
);
