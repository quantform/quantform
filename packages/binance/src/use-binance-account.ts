import { decimal } from '@quantform/core';

import { useBinanceSignedRequest } from './use-binance-signed-request';

export const useBinanceAccount = () =>
  useBinanceSignedRequest<{
    makerCommission: number;
    takerCommission: number;
    balances: Array<{
      asset: string;
      free: decimal;
      locked: decimal;
    }>;
  }>({
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
