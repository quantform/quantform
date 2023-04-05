import { filter, switchMap, tap, withLatestFrom } from 'rxjs';

import { binance, useBinanceInstrument, useBinanceOrders } from '@quantform/binance';
import { d, exclude, instrumentNotSupported, InstrumentSelector } from '@quantform/core';
/*
export const useEnter = (instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    exclude(instrumentNotSupported),
    filter(it => Object.values(it).length === 0),
    withLatestFrom(
      useBinanceInstrument(instrument).pipe(exclude(instrumentNotSupported))
    ),
    switchMap(([, instrument]) =>
      useBinanceOrderOpen({
        instrument,
        quantity: d('1000'),
        rate: d('0.00000070'),
        type: 'LIMIT',
        timeInForce: 'GTC'
      }).pipe(tap(it => console.log('opened', it.orderId)))
    )
  );
*/
