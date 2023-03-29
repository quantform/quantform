import {
  combineLatest,
  interval,
  shareReplay,
  skipWhile,
  switchMap,
  takeUntil
} from 'rxjs';
import { z } from 'zod';

import { use } from '@quantform/core';

import { useBinanceRequest } from './use-binance-request';
import { useOptions } from './use-options';
import { useReadonlySocket } from './use-readonly-socket';

const contract = z.discriminatedUnion('e', [
  z.object({
    e: z.literal('outboundAccountPosition'),
    B: z.array(
      z.object({
        a: z.string(),
        f: z.string(),
        l: z.string()
      })
    )
  }),
  z.object({
    e: z.literal('executionReport'),
    s: z.string(),
    C: z.string(),
    c: z.string(),
    q: z.string(),
    i: z.number(),
    S: z.string(),
    T: z.number(),
    p: z.string(),
    x: z.string()
  })
]);

export const useUserChanges = use(() => {
  const listenKey = useBinanceListenKeyCreateRequest().pipe(shareReplay(1));

  const keepAlive = combineLatest([interval(1000 * 60 * 30), listenKey]).pipe(
    switchMap(([, it]) => useBinanceListenKeyKeepAliveRequest(it.listenKey)),
    skipWhile(() => true)
  );

  return listenKey.pipe(
    switchMap(it => useReadonlySocket(contract, `/ws/${it.listenKey}`)),
    takeUntil(keepAlive)
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
