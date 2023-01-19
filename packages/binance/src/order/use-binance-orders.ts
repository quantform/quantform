import { combineLatest, map, Observable, switchMap } from 'rxjs';

import { d, decimal, Instrument, useTimestamp } from '@quantform/core';

import { useBinanceInstruments } from '@lib/instrument';
import { useBinanceConnector } from '@lib/use-binance-connector';

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

export function useBinanceOrders(): Observable<BinanceOrder[]> {
  return combineLatest([
    useBinanceConnector().pipe(switchMap(it => it.openOrders())),
    useBinanceInstruments()
  ]).pipe(
    map(([orders, instruments]) =>
      orders.map(it => mapBinanceToOrder(it, instruments)).filter(it => it)
    )
  );
}

export function mapBinanceToOrder(
  response: any,
  instruments: Instrument[]
): BinanceOrder | undefined {
  const instrument = instruments.find(it => it.raw == response.symbol);
  if (!instrument) {
    return undefined;
  }

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
