import {
  combineLatest,
  interval,
  shareReplay,
  skipWhile,
  switchMap,
  takeUntil
} from 'rxjs';
import { z } from 'zod';

import { withMemo } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';
import { useBinanceRequest } from './use-binance-request';
import { useBinanceSocket } from './use-binance-socket';

export const useBinanceUserSocket = withMemo(() => {
  const listenKey = useBinanceListenKeyCreateRequest().pipe(shareReplay(1));

  const keepAlive = combineLatest([interval(1000 * 60 * 30), listenKey]).pipe(
    switchMap(([, it]) => useBinanceListenKeyKeepAliveRequest(it.listenKey)),
    skipWhile(() => true)
  );

  return listenKey.pipe(
    switchMap(it => useBinanceSocket(z.any(), `/ws/${it.listenKey}`)),
    takeUntil(keepAlive)
  );
});

function useBinanceListenKeyCreateRequest() {
  const { apiKey } = useBinanceOptions();

  return useBinanceRequest(z.object({ listenKey: z.string() }), {
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey!,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

function useBinanceListenKeyKeepAliveRequest(listenKey: string) {
  const { apiKey } = useBinanceOptions();

  return useBinanceRequest(z.any(), {
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey!,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}
