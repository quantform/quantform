import { cancelOrderRequest } from '@lib/api';
import { Instrument } from '@quantform/core';

export function cancelOrder({
  id,
  binanceId,
  instrument
}: {
  id?: string;
  binanceId?: number;
  instrument: Instrument;
}) {
  return cancelOrderRequest({
    orderId: binanceId,
    origClientOrderId: id,
    symbol: instrument.raw
  });
}
