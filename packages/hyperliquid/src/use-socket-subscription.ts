import { filter, map, switchMap } from 'rxjs';

import { useMemo } from '@quantform/core';

import { useSocket } from './use-socket';

export function useSocketSubscription(
  subscription: { type: string } & Record<string, unknown>
) {
  return useMemo(() => {
    const { watch, send, monitor } = useSocket();

    return monitor().pipe(
      filter(it => it === 'opened'),
      switchMap(() => send({ payload: { method: 'subscribe', subscription } })),
      switchMap(() =>
        watch().pipe(
          filter(({ payload }) => {
            const message = payload as { channel: string; data: unknown };

            if (message.channel === 'error') {
              throw new Error(JSON.stringify(message.data));
            }

            return message.channel === subscription.type;
          }),
          map(({ timestamp, payload }) => {
            const message = payload as { data: unknown };

            return { timestamp, payload: message.data };
          })
        )
      )
    );
  }, [
    'hyperliquid',
    'use-socket-subscription',
    ...Object.values(subscription).map(it => JSON.stringify(it))
  ]);
}
