import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, Instrument, useTimestamp } from '@quantform/core';

import { useBinanceOpenOrdersState } from './use-binance-open-orders-state';

const schema = z.array(z.any());

export function useBinanceOpenOrdersRequest(instrument: Instrument) {
  const [, setOpened] = useBinanceOpenOrdersState(instrument);

  return useBinanceSignedRequest(schema, {
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(
    map(it => it.map(it => mapBinanceToOrder(it, instrument, useTimestamp()))),
    map(incomingOrders =>
      setOpened(opened =>
        incomingOrders.reduce((opened, order) => {
          if (opened[order.id]) {
            Object.assign(opened[order.id], order);
          } else {
            opened[order.id] = order;
          }

          return opened;
        }, opened)
      )
    )
  );
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
