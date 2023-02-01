import { map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import {
  d,
  decimal,
  Instrument,
  InstrumentSelector,
  useState,
  useTimestamp
} from '@quantform/core';

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

export function useBinanceOrders(
  instrument: InstrumentSelector
): Observable<BinanceOrder[] | typeof instrumentNotSupported> {
  const [orders] = useState(
    useBinanceInstrument(instrument).pipe(
      switchMap(instrument => {
        if (instrument === instrumentNotSupported) {
          return of(instrumentNotSupported);
        }

        return useBinanceOpenOrdersQuery(instrument);
      }),
      shareReplay(1)
    ),
    [useBinanceOrders.name, instrument.id]
  );

  return orders;
}

function useBinanceOpenOrdersQuery(instrument: Instrument) {
  return useBinanceSignedRequest<Array<any>>({
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(map(it => it.map(it => mapBinanceToOrder(it, instrument))));
}

function mapBinanceToOrder(response: any, instrument: Instrument): BinanceOrder {
  const quantity = d(response.origQty);

  return {
    timestamp: useTimestamp(),
    id: response.clientOrderId,
    binanceId: response.orderId,
    instrument: instrument,
    quantity: response.side == 'BUY' ? quantity : quantity.mul(-1),
    quantityExecuted: d(response.executedQty),
    rate: response.price ? d(response.price) : undefined,
    averageExecutionRate: undefined,
    createdAt: response.time
  };
}
