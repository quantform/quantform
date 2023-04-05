import { ignoreElements, interval, map, retry, switchMap, takeUntil } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { use } from '@quantform/core';

import { useUserListenKeyKeepAliveRequest } from './use-user-listen-key-keep-alive-request';
import { useUserListenKeyRequest } from './use-user-listen-key-request';

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

export const useUserSocket = use(() =>
  useUserListenKeyRequest().pipe(
    switchMap(payload =>
      useReadonlySocket(`/ws/${payload.listenKey}`).pipe(
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: messageType.parse(payload)
        })),
        takeUntil(
          interval(1000 * 60 * 30).pipe(
            switchMap(() => useUserListenKeyKeepAliveRequest(payload.listenKey)),
            ignoreElements()
          )
        )
      )
    ),
    retry({ delay: 1000 })
  )
);
