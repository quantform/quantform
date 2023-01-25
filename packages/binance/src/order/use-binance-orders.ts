import { from, map, Observable, of, switchMap, tap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { useBinanceConnector } from '@lib/use-binance-connector';
import {
  d,
  decimal,
  Instrument,
  InstrumentSelector,
  useTimestamp
} from '@quantform/core';

type BinanceOrder = {
  timestamp: number;
  binanceId?: number;
  instrument: Instrument;
  quantity: decimal;
  quantityExecuted: decimal;
  rate?: decimal;
  averageExecutionRate?: decimal;
  createdAt: number;
};

export function useBinanceOrders(
  instrument: InstrumentSelector
): Observable<BinanceOrder[] | typeof instrumentNotSupported> {
  return useBinanceInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useBinanceConnector().pipe(
        switchMap(it => from(it.openOrders(instrument.raw))),
        map(it => it.map(it => mapBinanceToOrder(it, instrument)))
      );
    })
  );
}

export function mapBinanceToOrder(response: any, instrument: Instrument): BinanceOrder {
  const quantity = d(response.origQty);

  return {
    timestamp: useTimestamp(),
    binanceId: response.orderId,
    instrument: instrument,
    quantity: response.side == 'BUY' ? quantity : quantity.mul(-1),
    quantityExecuted: d(0),
    rate: response.price ? d(response.price) : undefined,
    averageExecutionRate: undefined,
    createdAt: response.time
  };
}
