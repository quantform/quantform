import { ignoreElements, interval, map, switchMap, takeUntil } from 'rxjs';
import { z } from 'zod';

import { withMemo } from '@quantform/core';

import { whenSocket } from './when-socket';
import { withUserListenKeyKeepAliveRequest } from './with-user-listen-key-keep-alive-request';
import { withUserListenKeyRequest } from './with-user-listen-key-request';

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
    x: z.enum(['NEW', 'CANCELED', 'REJECTED', 'TRADE', 'EXPIRED', 'TRADE_PREVENTION']),
    X: z.enum([
      'NEW',
      'PARTIALLY_FILLED',
      'FILLED',
      'CANCELED',
      'REJECTED',
      'EXPIRED',
      'EXPIRED_IN_MATCH'
    ]),
    z: z.string()
  })
]);

export const whenUserAccountSocket = withMemo(() =>
  withUserListenKeyRequest().pipe(
    switchMap(({ payload }) =>
      whenSocket(`/ws/${payload.listenKey}`).pipe(
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: messageType.parse(payload)
        })),
        takeUntil(
          interval(1000 * 60 * 30).pipe(
            switchMap(() => withUserListenKeyKeepAliveRequest(payload.listenKey)),
            ignoreElements()
          )
        )
      )
    )
  )
);
