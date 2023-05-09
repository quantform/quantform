import { ignoreElements, interval, map, retry, switchMap, takeUntil } from 'rxjs';
import { z } from 'zod';

import { useOptions } from '@lib/use-options';
import { whenSocket } from '@lib/when-socket';
import { withMemo } from '@quantform/core';

import { withUserListenKey } from './with-user-listen-key';
import { withUserListenKeyKeepAlive } from './with-user-listen-key-keep-alive';

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

export const whenUserAccount = withMemo(() => {
  const { retryDelay } = useOptions();

  return withUserListenKey().pipe(
    switchMap(({ payload }) =>
      whenSocket(`/ws/${payload.listenKey}`).pipe(
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: messageType.parse(payload)
        })),
        takeUntil(
          interval(1000 * 60 * 30).pipe(
            switchMap(() => withUserListenKeyKeepAlive(payload.listenKey)),
            ignoreElements()
          )
        )
      )
    ),
    retry({ delay: retryDelay })
  );
});
