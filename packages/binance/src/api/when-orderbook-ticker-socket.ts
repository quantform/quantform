import { map, switchMap, tap } from 'rxjs';
import { z } from 'zod';

import { replay, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';
import { whenSocket } from './when-socket';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

const socket = replay(
  (symbol: string) =>
    whenSocket(`ws/${symbol.toLowerCase()}@bookTicker`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
  ['binance', 'orderbook-ticker']
);

export function whenOrderbookTickerSocket(
  ...args: Parameters<typeof socket>
): ReturnType<typeof socket> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return socket(...args);
  }

  return withSimulator().pipe(
    switchMap(({ apply }) =>
      socket(...args).pipe(
        tap(event => apply(simulator => simulator.whenOrderbookTicker(args, event)))
      )
    )
  );
}
