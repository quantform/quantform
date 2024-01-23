import { Instrument } from '@quantform/core';

import { withOrderCancelRequest } from './api/with-order-cancel-request';

export function withOrderCancel({
  id,
  binanceId,
  instrument
}: {
  id?: string;
  binanceId?: number;
  instrument: Instrument;
}) {
  return withOrderCancelRequest({
    orderId: binanceId,
    origClientOrderId: id,
    symbol: instrument.raw
  });
}
