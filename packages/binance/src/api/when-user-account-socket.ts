import { filter, ignoreElements, interval, map, switchMap, takeUntil } from 'rxjs';
import { z } from 'zod';

import { InferObservableType, useExecutionMode, withMemo } from '@quantform/core';

import { withSimulator } from './simulator';
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

const socket = withMemo(() =>
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

export function whenUserAccountSocket(
  ...args: Parameters<typeof socket>
): ReturnType<typeof socket> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return socket(...args);
  }

  return withSimulator().pipe(
    switchMap(({ event }) => event),
    map(event => {
      switch (event.type) {
        case 'simulator-inventory-balance-changed':
          return {
            timestamp: event.timestamp,
            payload: {
              e: 'outboundAccountPosition' as const,
              B: [
                {
                  a: event.asset.name,
                  f: event.free.toString(),
                  l: event.locked.toString()
                }
              ]
            }
          };
        case 'simulator-instrument-order-settled':
        case 'simulator-instrument-order-trade':
        case 'simulator-instrument-order-rejected':
        case 'simulator-instrument-order-canceled':
        case 'simulator-instrument-order-filled':
          return {
            timestamp: event.timestamp,
            payload: {
              e: 'executionReport' as const,
              s: event.order.instrument.raw,
              C: event.order.clientOrderId,
              c: event.order.clientOrderId,
              q: event.order.quantity.abs().toString(),
              i: event.order.id,
              S: event.order.quantity.gt(0) ? 'BUY' : 'SELL',
              T: event.timestamp,
              p: event.order.price?.toString(),
              x: event.order.status,
              X: event.order.status,
              z: event.order.executedQuantity.toString()
            }
          };
        default:
          return undefined;
      }
    }),
    filter(it => it !== undefined),
    map(it => it as InferObservableType<ReturnType<typeof socket>>)
  );
}
