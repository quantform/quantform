import { map, of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import {
  decimal,
  Instrument,
  InstrumentSelector,
  useMemo,
  useState
} from '@quantform/core';

import { useBinanceOpenOrdersQuery } from './use-binance-open-orders-query';

type BinanceOrder = {
  id: string;
  timestamp: number;
  binanceId?: number;
  instrument: Instrument;
  quantity: decimal;
  quantityExecuted: decimal;
  rate?: decimal;
  averageExecutionRate?: decimal;
  createdAt: number;
  cancelable: boolean;
};

export function useBinanceOpenOrdersState(instrument: InstrumentSelector) {
  return useState<Record<string, BinanceOrder>>({}, [
    useBinanceOpenOrdersState.name,
    instrument.id
  ]);
}

export function useBinanceOpenOrders(instrument: InstrumentSelector) {
  const [, setOpened] = useBinanceOpenOrdersState(instrument);

  return useMemo(
    () =>
      useBinanceInstrument(instrument).pipe(
        switchMap(instrument => {
          if (instrument === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          return useBinanceOpenOrdersQuery(instrument).pipe(
            switchMap(incomingOrders =>
              setOpened(opened =>
                incomingOrders.reduce((opened, order) => {
                  if (opened[order.id]) {
                    Object.assign(opened[order.id], order);
                  } else {
                    opened[order.id] = order;
                  }

                  return opened;
                }, opened)
              ).pipe(map(it => Object.values(it)))
            )
          );
        }),
        shareReplay(1)
      ),
    [(useBinanceOpenOrders.name, instrument.id)]
  );
}
