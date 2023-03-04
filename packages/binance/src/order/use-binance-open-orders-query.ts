import { map } from 'rxjs';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, Instrument, useTimestamp } from '@quantform/core';

export function useBinanceOpenOrdersQuery(instrument: Instrument) {
  const { timestamp } = useTimestamp();

  return useBinanceSignedRequest<Array<any>>({
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(map(it => it.map(it => mapBinanceToOrder(it, instrument, timestamp()))));
}

function mapBinanceToOrder(response: any, instrument: Instrument, timestamp: number) {
  const quantity = d(response.origQty);

  return {
    timestamp,
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
