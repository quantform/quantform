import { map, switchMap, tap } from 'rxjs';
import { z } from 'zod';

import { replay, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';
import { whenSocket } from './when-socket';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  b: z.number(),
  a: z.number(),
  m: z.boolean()
});

const socket = replay(
  (symbol: string) =>
    whenSocket(`ws/${symbol.toLowerCase()}@trade`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
  ['binance', 'trade']
);

export function whenTradeSocket(
  ...args: Parameters<typeof socket>
): ReturnType<typeof socket> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return socket(...args);
  }

  return withSimulator().pipe(
    switchMap(({ apply }) =>
      socket(...args).pipe(
        tap(event => apply(simulator => simulator.whenTrade(args, event)))
      )
    )
  );
}
