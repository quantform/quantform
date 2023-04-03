import { filter, switchMap, tap, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import { useOrders } from '@quantform/binance/dist/order';
import { d, exclude, instrumentNotSupported, InstrumentSelector } from '@quantform/core';

export const useEnter = (instrument: InstrumentSelector) =>
  useOrders(instrument).pipe(
    exclude(instrumentNotSupported),
    filter(it => Object.values(it).length === 0),
    withLatestFrom(
      Binance.useInstrument(instrument).pipe(exclude(instrumentNotSupported))
    ),
    switchMap(([, instrument]) =>
      Binance.useOrderOpen({
        instrument,
        quantity: d('1000'),
        rate: d('0.00000070'),
        type: 'LIMIT',
        timeInForce: 'GTC'
      }).pipe(tap(it => console.log('opened', it.orderId)))
    )
  );
