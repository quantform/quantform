import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/with-signed-request';
import { Instrument, useTimestamp } from '@quantform/core';

const responseType = z.object({
  symbol: z.string(),
  origClientOrderId: z.string(),
  orderId: z.number(),
  orderListId: z.number(),
  clientOrderId: z.string(),
  price: z.string(),
  origQty: z.string(),
  executedQty: z.string(),
  cummulativeQuoteQty: z.string(),
  status: z.enum([
    'NEW',
    'PARTIALLY_FILLED',
    'FILLED',
    'CANCELED',
    'REJECTED',
    'EXPIRED',
    'EXPIRED_IN_MATCH'
  ]),
  timeInForce: z.string(),
  type: z.string(),
  side: z.string(),
  selfTradePreventionMode: z.string()
});

export const withOrderCancel = ({
  id,
  binanceId,
  instrument
}: {
  id?: string;
  binanceId?: number;
  instrument: Instrument;
}) =>
  withSignedRequest({
    method: 'DELETE',
    patch: '/api/v3/order',
    query: {
      symbol: instrument.raw,
      orderId: binanceId ?? undefined,
      origClientOrderId: id ?? undefined
    }
  }).pipe(
    map(response => ({
      timestamp: useTimestamp(),
      payload: responseType.parse(response)
    }))
  );
