import { map } from 'rxjs';
import { z } from 'zod';

import { useMemo, useReplay } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  notification: z.string()
});

export function watchNotifications(user: string) {
  const key = hash(user);

  return useMemo(
    () =>
      useReplay(useSocketSubscription({ type: 'notification', user }), key).pipe(
        map(it => payloadType.parse(it.payload))
      ),
    key
  );
}

export function hash(user: string) {
  return ['hyperliquid', 'watch-notifications', user];
}
