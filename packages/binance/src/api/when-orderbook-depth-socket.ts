import { map, switchMap, tap } from 'rxjs';
import { z } from 'zod';

import { d, replay, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';
import { whenSocket } from './when-socket';

const messageType = z.object({
  lastUpdateId: z.number(),
  asks: z.array(z.array(z.string())),
  bids: z.array(z.array(z.string()))
});

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

const socket = replay(
  (symbol: string, level: Level) =>
    whenSocket(`ws/${symbol.toLowerCase()}@depth${level}`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
  ['binance', 'orderbook-depth']
);

export function watchOrderbookDepthSocket(
  ...args: Parameters<typeof socket>
): ReturnType<typeof socket> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return socket(...args);
  }

  return withSimulator().pipe(
    switchMap(({ apply }) =>
      socket(...args).pipe(
        tap(event =>
          apply(simulator => {
            simulator.tick({
              timestamp: event.timestamp,
              symbol: args[0],
              ask: {
                quantity: d(event.payload.asks[0][1]),
                rate: d(event.payload.asks[0][0])
              },
              bid: {
                quantity: d(event.payload.bids[0][1]),
                rate: d(event.payload.bids[0][0])
              }
            });
          })
        )
      )
    )
  );
}
