import { map } from 'rxjs';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, Instrument, useTimestamp } from '@quantform/core';

export function useBinanceOpenOrdersQuery(instrument: Instrument) {
  return useBinanceSignedRequest<Array<any>>({
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(map(it => it.map(it => mapBinanceToOrder(it, instrument))));
}

function mapBinanceToOrder(response: any, instrument: Instrument) {
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
    createdAt: response.time,
    cancelable: true
  };
}