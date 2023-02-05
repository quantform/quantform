import { map, of, shareReplay, switchMap, withLatestFrom } from 'rxjs';

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
};

const state = (instrument: InstrumentSelector) =>
  useState<Record<string, BinanceOrder>>({}, [
    useBinanceOpenOrders.name,
    instrument.id,
    'state'
  ]);

export function useBinanceOpenOrders(instrument: InstrumentSelector) {
  return useMemo(
    () =>
      useBinanceInstrument(instrument).pipe(
        switchMap(instrument => {
          if (instrument === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          const [opened, setOpened] = state(instrument);

          return useBinanceOpenOrdersQuery(instrument).pipe(
            withLatestFrom(opened),
            switchMap(([incomingOrders, snapshot]) => {
              setOpened(
                incomingOrders.reduce((snapshot, order) => {
                  if (snapshot[order.id]) {
                    Object.assign(snapshot[order.id], order);
                  } else {
                    snapshot[order.id] = order;
                  }

                  return snapshot;
                }, snapshot)
              );

              return opened.pipe(map(it => Object.values(it)));
            })
          );
        }),
        shareReplay(1)
      ),
    [useBinanceOpenOrders.name, instrument.id]
  );
}

useBinanceOpenOrders.state = state;
