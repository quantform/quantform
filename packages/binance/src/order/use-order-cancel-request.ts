import { z } from 'zod';

import { useSignedRequest } from '@lib/use-signed-request';
import { Instrument } from '@quantform/core';

const contract = z.object({
  symbol: z.string(),
  origClientOrderId: z.string(),
  orderId: z.number(),
  orderListId: z.number(),
  clientOrderId: z.string(),
  price: z.string(),
  origQty: z.string(),
  executedQty: z.string(),
  cummulativeQuoteQty: z.string(),
  status: z.string(),
  timeInForce: z.string(),
  type: z.string(),
  side: z.string(),
  selfTradePreventionMode: z.string()
});

export const useOrderCancelRequest = ({
  id,
  binanceId,
  instrument
}: {
  id?: string;
  binanceId?: number;
  instrument: Instrument;
}) =>
  useSignedRequest(contract, {
    method: 'DELETE',
    patch: '/api/v3/order',
    query: {
      symbol: instrument.raw,
      orderId: binanceId ?? undefined,
      origClientOrderId: id ?? undefined
    }
  });
