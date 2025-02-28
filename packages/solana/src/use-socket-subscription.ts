import { randomUUID } from 'crypto';
import { combineLatest, filter, map, switchMap } from 'rxjs';

import { Commitment } from './commitment';
import { useSocket } from './use-socket';

export function useSocketSubscription<T>(
  commitment: Commitment,
  subscription: { method: string; params: Array<unknown> }
) {
  const { watch, send, monitor } = useSocket(commitment);
  const id = randomUUID();

  return combineLatest([
    watch().pipe(
      map(({ payload }) => {
        const notification = payload as {
          id?: string;
          error?: { code: number; message: string };
          result: number;
        };

        if (notification.error) {
          throw new Error(JSON.stringify(notification.error));
        }

        return notification.id == id ? notification.result : undefined;
      }),
      filter(it => it != undefined)
    ),
    monitor().pipe(
      filter(it => it === 'opened'),
      switchMap(() => send({ payload: { ...subscription, id, jsonrpc: '2.0' } }))
    )
  ]).pipe(
    switchMap(([subscription]) =>
      watch().pipe(
        filter(({ payload }) => {
          const { params } = payload as {
            params: { subscription: number };
          };

          return params.subscription == subscription;
        }),
        map(({ timestamp, payload }) => {
          const { params } = payload as {
            params: {
              result: {
                context: {
                  slot: number;
                };
                value: T;
              };
            };
          };

          return { timestamp, payload: params.result };
        })
      )
    )
  );
}
