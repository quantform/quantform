import { map, switchMap, tap } from 'rxjs';
import { z } from 'zod';

import { replay, useExecutionMode } from '@quantform/core';

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

export function whenOrderbookDepthSocket(
  ...args: Parameters<typeof socket>
): ReturnType<typeof socket> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return socket(...args);
  }

  return withSimulator().pipe(
    switchMap(({ apply }) =>
      socket(...args).pipe(
        tap(event => apply(simulator => simulator.whenOrderbookDepth(args, event)))
      )
    )
  );
}
