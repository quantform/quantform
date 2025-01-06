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
            const { channel, data } = payload as { channel: string; data: unknown };

            switch (channel) {
              case 'error':
                throw new Error(JSON.stringify(data));
              default:
                return channel === subscription.type;
            }
          }),
          map(({ timestamp, payload }) => {
            const { data } = payload as { data: unknown };

            return { timestamp, payload: data };
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
