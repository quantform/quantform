import { map, switchMap, tap } from 'rxjs';
import { z } from 'zod';

import { d, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';
import { whenSocket } from './when-socket';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

const socket = (symbol: string) =>
  whenSocket(`ws/${symbol.toLowerCase()}@bookTicker`).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: messageType.parse(payload)
    }))
  );

export function watchOrderbookTickerSocket(
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
                quantity: d(event.payload.A),
                rate: d(event.payload.a)
              },
              bid: {
                quantity: d(event.payload.B),
                rate: d(event.payload.b)
              }
            });
          })
        )
      )
    )
  );
}
