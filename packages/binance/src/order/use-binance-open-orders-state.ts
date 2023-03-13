import { Observable } from 'rxjs';

import {
  decimal,
  Instrument,
  InstrumentSelector,
  useState,
  withMemo
} from '@quantform/core';

export type BinanceOrder = {
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

export const useBinanceOpenOrdersState = withMemo(
  (
    instrument: InstrumentSelector
  ): [
    Observable<Readonly<Record<string, BinanceOrder>>>,
    (
      value:
        | Record<string, BinanceOrder>
        | ((p: Record<string, BinanceOrder>) => Record<string, BinanceOrder>)
    ) => Readonly<Record<string, BinanceOrder>>
  ] =>
    useState<Record<string, BinanceOrder>>({}, [
      useBinanceOpenOrdersState.name,
      instrument.id
    ])
);
