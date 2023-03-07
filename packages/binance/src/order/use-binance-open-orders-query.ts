import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, Instrument, useTimestamp } from '@quantform/core';

const schema = z.array(z.any());

export function useBinanceOpenOrdersQuery(instrument: Instrument) {
  return useBinanceSignedRequest(schema, {
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(map(it => it.map(it => mapBinanceToOrder(it, instrument, useTimestamp()))));
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
