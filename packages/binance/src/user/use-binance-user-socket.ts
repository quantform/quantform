import { ignoreElements, interval, map, retry, switchMap, takeUntil } from 'rxjs';
import { z } from 'zod';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { use } from '@quantform/core';

import { useBinanceOptions } from '..';
import { useBinanceUserListenKeyKeepAliveRequest } from './use-binance-user-listen-key-keep-alive-request';
import { useBinanceUserListenKeyRequest } from './use-binance-user-listen-key-request';

const messageType = z.discriminatedUnion('e', [
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

export const useBinanceUserSocket = use(() => {
  const { retryDelay } = useBinanceOptions();

  return useBinanceUserListenKeyRequest().pipe(
    switchMap(({ payload }) =>
      useBinanceSocket(`/ws/${payload.listenKey}`).pipe(
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: messageType.parse(payload)
        })),
        takeUntil(
          interval(1000 * 60 * 30).pipe(
            switchMap(() => useBinanceUserListenKeyKeepAliveRequest(payload.listenKey)),
            ignoreElements()
          )
        )
      )
    ),
    retry({ delay: retryDelay })
  );
});
