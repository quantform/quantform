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

import { useBinanceRequest } from './use-binance-request';
import { useOptions } from './use-options';
import { useReadonlySocket } from './use-readonly-socket';

export const useUserChanges = withMemo(() => {
  const listenKey = useBinanceListenKeyCreateRequest().pipe(shareReplay(1));

  const keepAlive = combineLatest([interval(1000 * 60 * 30), listenKey]).pipe(
    switchMap(([, it]) => useBinanceListenKeyKeepAliveRequest(it.listenKey)),
    skipWhile(() => true)
  );

  return listenKey.pipe(
    switchMap(it => useReadonlySocket(z.any(), `/ws/${it.listenKey}`)),
    takeUntil(keepAlive),
    shareReplay(1)
  );
});

function useBinanceListenKeyCreateRequest() {
  const { apiKey } = useOptions();

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
  const { apiKey } = useOptions();

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
