import { map } from 'rxjs';
import { z } from 'zod';

import { useMemo } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  // TODO: add schema
});

export function watchWeb2Data(user: string) {
  const key = hash(user);

  return useMemo(
    () =>
      useSocketSubscription({ type: 'WebData2', user }).pipe(
        map(it => payloadType.parse(it.payload))
      ),
    key
  );
}

export function hash(user: string) {
  return ['hyperliquid', 'watch-web2-data', user];
}
